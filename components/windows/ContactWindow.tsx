import { about, contact } from "@/lib/content";
import { IconArrowUpRight } from "@/components/ui/icons";
import { WindowFrame } from "./WindowFrame";

/** Mail compose window. Every field is a real, working link. */
export function ContactWindow({ className = "" }: { className?: string }) {
  return (
    <WindowFrame id="contact" title="New Message" meta="Draft" className={`win-mail ${className}`}>
      <div className="mail">
        <dl className="mail-fields">
          <div className="mail-row" data-field>
            <dt>To</dt>
            <dd>
              <a href={`mailto:${contact.email}`} className="mail-chip">
                {contact.email}
              </a>
            </dd>
          </div>
          <div className="mail-row" data-field>
            <dt>Phone</dt>
            <dd>
              <a href={contact.phoneHref}>{contact.phone}</a>
            </dd>
          </div>
          <div className="mail-row" data-field>
            <dt>LinkedIn</dt>
            <dd>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                Vaibhav Singla <IconArrowUpRight className="mail-ico" />
              </a>
            </dd>
          </div>
          <div className="mail-row" data-field>
            <dt>Instagram</dt>
            <dd className="mail-ig">
              {contact.instagram.map((ig) => (
                <a key={ig.handle} href={ig.href} target="_blank" rel="noopener noreferrer">
                  {ig.handle}
                </a>
              ))}
            </dd>
          </div>
        </dl>
        <div className="mail-body" data-field>
          <h2 id="contact-heading" className="mail-h">
            Contact me
          </h2>
          <p className="mail-p">{about.callout}</p>
        </div>
        <div className="mail-actions" data-field>
          <a className="send-btn" href={`mailto:${contact.email}`}>
            Send email
            <IconArrowUpRight className="mail-ico" />
          </a>
          <a className="ghost-btn" href={contact.phoneHref}>
            Call
          </a>
        </div>
      </div>
    </WindowFrame>
  );
}
