import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { FlowingInk, type InkPalette } from "./FlowingInk";

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  /** Pigment palette, or `false` for plain glass. */
  ink?: InkPalette | false;
  animateInk?: boolean;
  inkSpeed?: number;
  /** Fainter pigment, for small panels such as captions. */
  inkSubtle?: boolean;
  /** Deeper, more opaque tint for text-heavy panels. */
  strong?: boolean;
  /** Frost whatever is behind the panel (use only over imagery). */
  blur?: boolean;
  grain?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/** Liquid-glass surface: tint, reflections, luminous edge and optional flowing ink. */
export function GlassPanel<T extends ElementType = "div">({
  as,
  children,
  className,
  ink = false,
  animateInk = false,
  inkSpeed,
  inkSubtle = false,
  strong = false,
  blur = false,
  grain = false,
  ...rest
}: GlassPanelProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      className={cx("glass", strong && "glass-strong", blur && "glass-blur", grain && "grain", className)}
      {...rest}
    >
      {ink && <FlowingInk palette={ink} animate={animateInk} speed={inkSpeed} subtle={inkSubtle} />}
      {children}
    </Tag>
  );
}
