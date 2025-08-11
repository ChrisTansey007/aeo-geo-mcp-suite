import type { Detail } from '../shared/types';
import { Drawer, DrawerTrigger, DrawerContent } from '../components';

export default function FixDrawer({
  details,
  children,
}: {
  details: Detail[];
  children: React.ReactNode;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="space-y-2 p-4">
        <h3 className="text-lg font-medium">Fixes</h3>
        <ul className="list-disc pl-5 text-sm">
          {details.map((d, i) => (
            <li key={i}>{d.message}</li>
          ))}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}
