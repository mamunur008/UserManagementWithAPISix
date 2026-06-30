import { CrudPage } from '../../components/ui/CrudPage.jsx';
import { userApi } from '../../services/userApi.js';
const api={ list:()=>Promise.resolve([]), create:()=>Promise.resolve({}), update:()=>Promise.resolve({}), remove:()=>Promise.resolve({}) };
export function UserRolesPage(){ return <CrudPage title="User Roles" eyebrow="ASSIGNMENT" description="Assign one or more local roles to each user." api={api} createPermission="permission:users.roles.assign" updatePermission="permission:users.roles.assign" deletePermission="permission:users.roles.remove" columns={[{key:'userRefId',label:'User'},{key:'roleId',label:'Role'}]} formFields={[{name:'userId',label:'User Id'},{name:'roleId',label:'Role Id'}]} /> }
