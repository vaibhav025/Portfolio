"use client";

import { contact } from "@/lib/content";
import { IconRewind } from "./icons";

/** Closing card: "Thank You", rewind-to-top and a tiny socials footer. */
export function Outro({ onRewind, className = "" }: { onRewind?: () => void; className?: string }) {
  return (
    <div className={`outro ${className}`} data-outro>
      <p className="outro-k" data-outro-item>
        End of sequence
      </p>
      <h2 className="outro-h" data-outro-item>
        Thank <em>you</em>
      </h2>
      <a
        className="outro-rewind"
        href="#top"
        data-outro-item
        data-magnetic
        onClick={(e) => {
          if (!onRewind) return;
          e.preventDefault();
          onRewind();
        }}
      >
        <IconRewind /> Back to top
      </a>
      <footer className="outro-foot" data-outro-item>
        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        {contact.instagram.map((ig) => (
          <a key={ig.handle} href={ig.href} target="_blank" rel="noopener noreferrer">
            {ig.handle}
          </a>
        ))}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <span>© {new Date().getFullYear()} Vaibhav Singla</span>
      </footer>
    </div>
  );
}
