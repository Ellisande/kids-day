import cx from "classnames";
export default function Hamburger(props: { className?: string }) {
  const { className } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cx("h-6 w-6", className || "")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}
