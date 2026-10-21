import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export function useTenant() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const { data: tenants = [], isLoading: isLoadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list(),
    enabled: !!user,
  });

  const tenant = user
    ? tenants.find(t => t.email?.toLowerCase() === user.email?.toLowerCase())
    : null;

  return {
    user,
    tenant,
    isLoading: isLoadingAuth || (!!user && isLoadingTenants),
    isTenant: !!tenant,
  };
}