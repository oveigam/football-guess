import { FC, ReactNode } from "react";

interface Props {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

const Button: FC<Props> = ({ type, disabled = false, children, onClick }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className="bg-primary-500 rounded-xl p-4 font-semibold uppercase text-white hover:bg-primary-400 active:scale-95"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
