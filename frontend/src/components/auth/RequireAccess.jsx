import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { canAccess } from '../../utils/access.js';
export function RequireAccess({ permissions=[], roles=[], children }){ const sessionUser=useSelector(s=>s.session.user); const me=useSelector(s=>s.menu.me || s.session.me); if(!canAccess(sessionUser, me, permissions, roles)) return <Navigate to="/" replace/>; return children; }
export function Can({ permissions=[], roles=[], children, fallback=null }){ const sessionUser=useSelector(s=>s.session.user); const me=useSelector(s=>s.menu.me || s.session.me); return canAccess(sessionUser, me, permissions, roles) ? children : fallback; }
