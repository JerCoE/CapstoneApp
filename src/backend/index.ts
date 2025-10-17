function parseJwtPayload(jwt) {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = atob(b64);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}
async function callRpc(fnName, body) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`RPC ${fnName} failed: ${res.status} ${text}`);
  }
  return text;
}
console.info('admin-user-management function started');
Deno.serve(async (req)=>{
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'only POST allowed'
      }), {
        status: 405
      });
    }
    const authHeader = req.headers.get('authorization') || '';
    const m = authHeader.match(/^Bearer (.+)$/);
    if (!m) {
      return new Response(JSON.stringify({
        error: 'missing Authorization Bearer token'
      }), {
        status: 401
      });
    }
    const userJwt = m[1];
    const payload = parseJwtPayload(userJwt);
    if (!payload || !payload.sub) {
      return new Response(JSON.stringify({
        error: 'invalid JWT'
      }), {
        status: 401
      });
    }
    const callerUid = payload.sub;
    const body = await req.json();
    if (!body.action || !body.target_user) {
      return new Response(JSON.stringify({
        error: 'action and target_user required'
      }), {
        status: 400
      });
    }
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({
        p_user: callerUid
      })
    });
    if (!checkRes.ok) {
      const txt = await checkRes.text();
      return new Response(JSON.stringify({
        error: 'failed to verify caller admin status',
        detail: txt
      }), {
        status: 500
      });
    }
    const isAdminText = await checkRes.text();
    const isAdmin = isAdminText.trim() === 't' || isAdminText.trim() === 'true';
    if (!isAdmin) {
      return new Response(JSON.stringify({
        error: 'caller is not admin'
      }), {
        status: 403
      });
    }
    if (body.action === 'delete') {
      await callRpc('admin_delete_user', {
        p_target_user: body.target_user,
        p_caller: callerUid
      });
      return new Response(JSON.stringify({
        status: 'ok',
        action: 'deleted',
        target: body.target_user
      }), {
        status: 200
      });
    } else if (body.action === 'add_role') {
      if (!body.role) return new Response(JSON.stringify({
        error: 'role required for add_role'
      }), {
        status: 400
      });
      await callRpc('admin_add_role', {
        p_target_user: body.target_user,
        p_role: body.role,
        p_caller: callerUid
      });
      return new Response(JSON.stringify({
        status: 'ok',
        action: 'added_role',
        role: body.role,
        target: body.target_user
      }), {
        status: 200
      });
    } else if (body.action === 'remove_role') {
      if (!body.role) return new Response(JSON.stringify({
        error: 'role required for remove_role'
      }), {
        status: 400
      });
      await callRpc('admin_remove_role', {
        p_target_user: body.target_user,
        p_role: body.role,
        p_caller: callerUid
      });
      return new Response(JSON.stringify({
        status: 'ok',
        action: 'removed_role',
        role: body.role,
        target: body.target_user
      }), {
        status: 200
      });
    } else if (body.action === 'replace_roles') {
      if (!body.roles) return new Response(JSON.stringify({
        error: 'roles array required for replace_roles'
      }), {
        status: 400
      });
      await callRpc('admin_update_user_roles', {
        p_target_user: body.target_user,
        p_new_roles: body.roles,
        p_caller: callerUid
      });
      return new Response(JSON.stringify({
        status: 'ok',
        action: 'replaced_roles',
        roles: body.roles,
        target: body.target_user
      }), {
        status: 200
      });
    } else {
      return new Response(JSON.stringify({
        error: 'unknown action'
      }), {
        status: 400
      });
    }
  } catch (err) {
    console.error('admin function error', err);
    return new Response(JSON.stringify({
      error: 'internal_server_error',
      detail: err.message
    }), {
      status: 500
    });
  }
});
