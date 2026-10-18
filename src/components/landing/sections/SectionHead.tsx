import type { ReactNode } from "react";
import Icon from "../Icon";

export default function SectionHead({ pill, title, children }: { pill: string; title: ReactNode; children: ReactNode }) {
  return (
    <div className="l-head" data-scrub="rise">
      <span className="tag-pill">
        <Icon name="check" />
        {pill}
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
