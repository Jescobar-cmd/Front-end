import { Button } from "../button";

export type RolCuenta = "cliente" | "freelancer";

interface RoleSelectorProps {
  value: RolCuenta;
  onChange: (rol: RolCuenta) => void;
  legend?: string;
}

export function RoleSelector({ value, onChange, legend = "Tipo de cuenta" }: RoleSelectorProps) {
  return (
    <fieldset className="roles role-selector">
      <legend>{legend}</legend>
      <Button
        type="button"
        variant={value === "cliente" ? "primary" : "secondary"}
        onClick={() => onChange("cliente")}
        aria-pressed={value === "cliente"}
      >
        Soy cliente
      </Button>
      <Button
        type="button"
        variant={value === "freelancer" ? "primary" : "secondary"}
        onClick={() => onChange("freelancer")}
        aria-pressed={value === "freelancer"}
      >
        Soy freelancer
      </Button>
    </fieldset>
  );
}
