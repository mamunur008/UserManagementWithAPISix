import {
  Building2,
  CheckCircle,
  Circle,
  CreditCard,
  LayoutDashboard,
  Link,
  Lock,
  Menu,
  Shield,
  Users,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  users: Users,
  shield: Shield,
  lock: Lock,
  link: Link,
  check: CheckCircle,
  menu: Menu,
  organization: Building2,
  payment: CreditCard,
};

export default function Icon({ name, size = 18, className = "" }) {
  const IconComponent = iconMap[name] || Circle;

  return <IconComponent size={size} className={className} />;
}
