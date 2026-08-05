"use client";

import React from "react";

/**
 * Renders Skool's ProseMirror documents (the "[v2]" lesson descriptions).
 * Node and mark names come straight from Skool's schema.
 */

interface Mark {
  type: string;
  attrs?: Record<string, any>;
}

interface Node {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  marks?: Mark[];
  content?: Node[];
}

function renderText(node: Node, key: React.Key): React.ReactNode {
  let el: React.ReactNode = node.text ?? "";

  for (const mark of node.marks || []) {
    switch (mark.type) {
      case "bold":
        el = <strong className="font-semibold">{el}</strong>;
        break;
      case "italic":
        el = <em className="italic">{el}</em>;
        break;
      case "code":
        el = (
          <code className="px-1.5 py-0.5 rounded bg-[#f3f4f6] border border-border text-[13px] font-mono">
            {el}
          </code>
        );
        break;
      case "link":
        el = (
          <a
            href={mark.attrs?.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-[#2563eb] hover:underline break-words"
          >
            {el}
          </a>
        );
        break;
      case "videoTimestamp": {
        // Skool renders these as buttons that seek the lesson video.
        const seconds = Number(mark.attrs?.time ?? mark.attrs?.seconds ?? 0);
        el = (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("seek-video", { detail: { seconds } }))}
            className="text-[#2563eb] hover:underline font-medium"
          >
            {el}
          </button>
        );
        break;
      }
      default:
        break;
    }
  }

  return <React.Fragment key={key}>{el}</React.Fragment>;
}

function renderNode(node: Node, key: React.Key): React.ReactNode {
  const kids = (node.content || []).map((c, i) => renderNode(c, i));

  switch (node.type) {
    case "text":
      return renderText(node, key);

    case "hardBreak":
      return <br key={key} />;

    case "paragraph":
      // Empty paragraphs are Skool's blank lines — keep the spacing.
      if (!node.content?.length) return <div key={key} className="h-4" />;
      return (
        <p key={key} className="mb-3 leading-[1.7] break-words">
          {kids}
        </p>
      );

    case "heading": {
      const level = Number(node.attrs?.level || 2);
      const cls =
        level === 1
          ? "text-[21px] font-bold mt-6 mb-3"
          : level === 2
            ? "text-[18px] font-bold mt-5 mb-2.5"
            : "text-[16px] font-bold mt-4 mb-2";
      const Tag = (`h${Math.min(Math.max(level, 1), 6)}`) as React.ElementType;
      return (
        <Tag key={key} className={cls}>
          {kids}
        </Tag>
      );
    }

    case "unorderedList":
    case "bulletList":
      return (
        <ul key={key} className="list-disc pl-6 mb-3 space-y-1">
          {kids}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} start={node.attrs?.start || 1} className="list-decimal pl-6 mb-3 space-y-1">
          {kids}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} className="leading-[1.7] [&>p]:mb-0">
          {kids}
        </li>
      );

    case "blockquote":
      return (
        <blockquote key={key} className="border-l-[3px] border-border pl-4 my-3 text-muted italic">
          {kids}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={key} className="my-5 border-t border-border" />;

    case "image":
      return (
        <img
          key={key}
          src={node.attrs?.src || node.attrs?.originalSrc}
          alt={node.attrs?.alt || ""}
          title={node.attrs?.title || undefined}
          className="max-w-full h-auto rounded-lg my-3 border border-border"
          loading="lazy"
        />
      );

    case "codeBlock":
      return (
        <pre key={key} className="bg-[#f3f4f6] border border-border rounded-lg p-3 my-3 overflow-x-auto text-[13px] font-mono">
          <code>{kids}</code>
        </pre>
      );

    default:
      // Unknown node: render its children so no content is silently dropped.
      return <React.Fragment key={key}>{kids}</React.Fragment>;
  }
}

export default function RichDoc({ doc, className = "" }: { doc: Node[] | null; className?: string }) {
  if (!doc || doc.length === 0) return null;
  return <div className={`text-[15px] text-foreground ${className}`}>{doc.map((n, i) => renderNode(n, i))}</div>;
}
