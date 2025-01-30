import type * as React from "react";

function VerificationIcon({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...props
}: React.SVGProps<SVGSVGElement> & {
  color?: string;
}) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="25" height="25" fill="url(#pattern0_20_4971)" />
      <defs>
        <pattern
          id="pattern0_20_4971"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_20_4971" transform="scale(0.015625)" />
        </pattern>
        <image
          id="image0_20_4971"
          width="64"
          height="64"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

export { VerificationIcon };
