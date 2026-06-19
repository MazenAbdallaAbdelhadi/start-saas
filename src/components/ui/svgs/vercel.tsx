import React from "react";

interface VercelIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const VercelIcon = (props: VercelIconProps) => {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Vercel</title>
      <path d="M24 22.525H0l12-21.05 12 21.05z" fill="currentColor" />
    </svg>
  );
};
