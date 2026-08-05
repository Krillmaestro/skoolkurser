"use client";

import React from "react";

/**
 * Renders Skool's community post markup.
 *
 * It is not standard markdown. Lists are written as `[ul][li]item[li]item`
 * with the items running to the end of the line, links and images use
 * markdown syntax, and round/square brackets inside text are backslash
 * escaped.
 */

type Inline = React.ReactNode;

const URL_RE = /(https?:\/\/[^\s<>()[\]]+)/g;

function unescape(text: string): string {
  return text.replace(/\\([()[\]\\*_~`])/g, "$1");
}

/** Links, images, bold/italic runs and bare URLs inside a single text run. */
function renderInline(raw: string, keyPrefix: string): Inline[] {
  const out: Inline[] = [];
  let rest = raw;
  let k = 0;

  // Matches ![alt](src) and [label](href) while skipping escaped brackets.
  const linkRe = /(!?)\[((?:[^\][\\]|\\.)*)\]\(([^)\s]*(?:\\.[^)\s]*)*)\)/;

  while (rest.length) {
    const m = linkRe.exec(rest);
    if (!m) {
      out.push(...renderPlain(rest, `${keyPrefix}-t${k++}`));
      break;
    }
    if (m.index > 0) out.push(...renderPlain(rest.slice(0, m.index), `${keyPrefix}-t${k++}`));

    const [, bang, label, href] = m;
    const url = unescape(href);
    if (bang) {
      out.push(
        <img
          key={`${keyPrefix}-i${k++}`}
          src={url}
          alt={unescape(label)}
          className="max-w-full h-auto rounded-lg my-2 border border-border"
          loading="lazy"
        />
      );
    } else {
      out.push(
        <a
          key={`${keyPrefix}-l${k++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-[#2563eb] hover:underline break-words"
        >
          {unescape(label)}
        </a>
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }

  return out;
}

/** Text with no link syntax left: handle emphasis and bare URLs. */
function renderPlain(text: string, keyPrefix: string): Inline[] {
  const out: Inline[] = [];
  let k = 0;

  const emphasisRe = /(\*\*|__)(.+?)\1|(\*|_)(?!\s)(.+?)(?<!\s)\3/;
  let rest = text;

  while (rest.length) {
    const m = emphasisRe.exec(rest);
    if (!m) {
      out.push(...linkifyBare(rest, `${keyPrefix}-p${k++}`));
      break;
    }
    if (m.index > 0) out.push(...linkifyBare(rest.slice(0, m.index), `${keyPrefix}-p${k++}`));

    if (m[1]) {
      out.push(
        <strong key={`${keyPrefix}-b${k++}`} className="font-semibold">
          {unescape(m[2])}
        </strong>
      );
    } else {
      out.push(
        <em key={`${keyPrefix}-e${k++}`} className="italic">
          {unescape(m[4])}
        </em>
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }

  return out;
}

function linkifyBare(text: string, keyPrefix: string): Inline[] {
  const parts = text.split(URL_RE);
  return parts.map((part, i) =>
    URL_RE.test(part) ? (
      <a
        key={`${keyPrefix}-u${i}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-[#2563eb] hover:underline break-words"
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={`${keyPrefix}-s${i}`}>{unescape(part)}</React.Fragment>
    )
  );
}

export default function PostContent({
  content,
  className = "",
  clamp,
}: {
  content: string;
  className?: string;
  clamp?: number;
}) {
  if (!content) return null;

  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // A line beginning a list: [ul][li]a[li]b   (or [ol] for numbered)
    const listMatch = line.match(/^\s*\[(ul|ol)\]([\s\S]*)$/);
    if (listMatch) {
      const ordered = listMatch[1] === "ol";
      const items = listMatch[2]
        .split("[li]")
        .map((s) => s.trim())
        .filter(Boolean);
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={`b${i}`}
          className={`${ordered ? "list-decimal" : "list-disc"} pl-6 mb-3 space-y-1`}
        >
          {items.map((item, j) => (
            <li key={j} className="leading-[1.7]">
              {renderInline(item, `b${i}-${j}`)}
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    // A run of dashes is Skool's divider.
    if (/^\s*-{5,}\s*$/.test(line)) {
      blocks.push(<hr key={`b${i}`} className="my-4 border-t border-border" />);
      continue;
    }

    if (line.trim() === "") {
      blocks.push(<div key={`b${i}`} className="h-3" />);
      continue;
    }

    blocks.push(
      <p key={`b${i}`} className="leading-[1.7] break-words whitespace-pre-wrap">
        {renderInline(line, `b${i}`)}
      </p>
    );
  }

  return (
    <div
      className={`text-[15px] text-foreground ${className}`}
      style={
        clamp
          ? {
              display: "-webkit-box",
              WebkitLineClamp: clamp,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }
          : undefined
      }
    >
      {blocks}
    </div>
  );
}
