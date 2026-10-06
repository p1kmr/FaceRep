import { ListRow } from '../ui/ListRow';
import { Toggle } from '../ui/Toggle';

interface ToggleRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  divider?: boolean;
}

export function ToggleRow({ title, subtitle, value, onValueChange, divider }: ToggleRowProps) {
  return (
    <ListRow
      title={title}
      subtitle={subtitle}
      divider={divider}
      right={<Toggle value={value} onValueChange={onValueChange} accessibilityLabel={title} />}
    />
  );
}
