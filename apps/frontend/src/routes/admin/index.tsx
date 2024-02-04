import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/')({
  component: Admin,
});

function Admin(): JSX.Element {
  return <div>Admin</div>;
}
