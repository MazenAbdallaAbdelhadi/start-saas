import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  asChild?: boolean;
}

export const LoadingButton = ({
  loading,
  children,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading ? <Spinner /> : children}
    </Button>
  );
};
