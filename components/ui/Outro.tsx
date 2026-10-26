import { contact } from "@/lib/content";
import { IconRewind } from "./icons";

/** Closing card: "Thank you", back-to-top and a tiny socials footer. The laptop closes here. */
export function Outro() {
  return (
    <section className="outro" data-pose="outro" aria-labelledby="outro-heading">
      <p className="eyebrow">End of sequence</p>
      <h2 id="outro-heading" className="outro-h">
        Thank <span>you.</span>
      </h2>
      <a className="btn btn-ghost" href="#top">
        <IconRewind className="btn-ico" /> Back to top
      </a>
      <footer className="outro-foot">
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
    </section>
  );
}
