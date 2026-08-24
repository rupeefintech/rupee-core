import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { Link } from 'react-router-dom';
import type { Components } from 'react-markdown';

interface Props {
  content: string;
}

const components: Components = {
  h2: ({ children, id, ...props }) => (
    <h2
      id={id}
      className="text-2xl font-bold text-ink mt-10 mb-4 pt-8 border-t-2 border-line first:border-t-0 first:pt-0 scroll-mt-24"
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({ children, id, ...props }) => (
    <h3 id={id} className="text-lg font-semibold text-ink mt-7 mb-3 scroll-mt-24" {...props}>
      {children}
    </h3>
  ),

  h4: ({ children, id, ...props }) => (
    <h4 id={id} className="text-base font-semibold text-ink mt-5 mb-2 scroll-mt-24" {...props}>
      {children}
    </h4>
  ),

  p: ({ children, ...props }) => (
    <p className="text-[15px] text-body leading-[1.8] mb-4" {...props}>
      {children}
    </p>
  ),

  a: ({ href, children, ...props }) => {
    if (href?.startsWith('/')) {
      return (
        <Link to={href} className="text-acc hover:text-ink font-semibold underline underline-offset-2 decoration-acc/30 hover:decoration-acc transition">
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-acc hover:text-ink font-semibold underline underline-offset-2 decoration-acc/30 hover:decoration-acc transition"
        {...props}
      >
        {children}
      </a>
    );
  },

  ul: ({ children, ...props }) => (
    <ul className="space-y-2.5 mb-5 text-[15px] text-body ml-1 md-ul" {...props}>
      {children}
    </ul>
  ),

  ol: ({ children, ...props }) => (
    <ol className="space-y-2.5 mb-5 text-[15px] text-body ml-1 md-ol" {...props}>
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li className="leading-[1.8] md-li" {...props}>
      {children}
    </li>
  ),

  blockquote: ({ children, ...props }) => {
    const text = String(children);
    let style = { border: 'border-acc', bg: 'bg-acc-deep', label: 'Info', labelColor: 'text-acc', labelBg: 'bg-acc/15' };

    if (text.includes('⚠') || text.includes('Warning')) {
      style = { border: 'border-gold', bg: 'bg-gold/10', label: 'Warning', labelColor: 'text-gold', labelBg: 'bg-gold/15' };
    } else if (text.includes('💡') || text.includes('Tip') || text.includes('Pro Tip')) {
      style = { border: 'border-mint', bg: 'bg-mint/10', label: 'Pro Tip', labelColor: 'text-mint', labelBg: 'bg-mint/15' };
    } else if (text.includes('📌') || text.includes('Note')) {
      style = { border: 'border-violet', bg: 'bg-violet-500/10', label: 'Note', labelColor: 'text-violet', labelBg: 'bg-violet-500/15' };
    } else if (text.includes('✅') || text.includes('Success')) {
      style = { border: 'border-mint', bg: 'bg-mint/10', label: 'Success', labelColor: 'text-mint', labelBg: 'bg-mint/15' };
    }

    return (
      <div className={`my-6 rounded-xl border-l-4 ${style.border} ${style.bg} overflow-hidden`}>
        <div className="px-5 py-4">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${style.labelColor} ${style.labelBg} px-2 py-0.5 rounded-full mb-2`}>
            {style.label}
          </span>
          <blockquote className="[&>p]:mb-0 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-body" {...props}>
            {children}
          </blockquote>
        </div>
      </div>
    );
  },

  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-8 rounded-xl border border-line shadow-sm">
      <table className="min-w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }) => (
    <thead className="bg-gradient-to-r from-acc to-acc-2" {...props}>
      {children}
    </thead>
  ),

  th: ({ children, ...props }) => (
    <th className="px-5 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-b border-acc-2" {...props}>
      {children}
    </th>
  ),

  tr: ({ children, ...props }) => (
    <tr className="even:bg-surface-2 hover:bg-acc-deep transition-colors" {...props}>
      {children}
    </tr>
  ),

  td: ({ children, ...props }) => {
    const text = String(children);
    // Style checkmarks and crosses
    if (text.trim() === '✅' || text.trim() === '✅ Yes' || text.trim() === '✅ Available') {
      return <td className="px-5 py-3 text-mint font-semibold border-b border-line" {...props}>{children}</td>;
    }
    if (text.trim() === '❌' || text.trim() === '❌ No' || text.trim() === '❌ Not Available') {
      return <td className="px-5 py-3 text-coral font-semibold border-b border-line" {...props}>{children}</td>;
    }
    return (
      <td className="px-5 py-3 text-body border-b border-line" {...props}>
        {children}
      </td>
    );
  },

  img: ({ src, alt, ...props }) => (
    <figure className="my-8">
      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        className="rounded-xl w-full shadow-md"
        {...props}
      />
      {alt && alt !== '' && (
        <figcaption className="text-center text-xs text-faint mt-2 italic">
          {alt}
        </figcaption>
      )}
    </figure>
  ),

  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-acc-deep text-acc px-1.5 py-0.5 rounded text-[13px] font-mono border border-acc/20" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={`block bg-bg-2 text-ink p-4 rounded-lg overflow-x-auto text-sm font-mono border border-line ${className || ''}`} {...props}>
        {children}
      </code>
    );
  },

  pre: ({ children, ...props }) => (
    <pre className="my-5 rounded-xl overflow-hidden shadow-sm" {...props}>
      {children}
    </pre>
  ),

  hr: () => <hr className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-line-2 to-transparent" />,

  strong: ({ children, ...props }) => (
    <strong className="font-bold text-ink" {...props}>
      {children}
    </strong>
  ),

  // Support HTML divs for concept cards (rehype-raw passes them through)
  div: ({ className, children, ...props }) => {
    // Concept card grid
    if (className === 'concept-grid') {
      return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 my-8" {...props}>{children}</div>;
    }
    // Individual concept card
    if (className === 'concept-card') {
      return (
        <div className="bg-surface rounded-xl border border-line p-5 hover:shadow-md hover:border-acc/40 transition-all" {...props}>
          {children}
        </div>
      );
    }
    // Concept card title
    if (className === 'concept-title') {
      return <h4 className="text-sm font-bold text-ink mb-2 flex items-center gap-2" {...props}>{children}</h4>;
    }
    // Concept card description
    if (className === 'concept-desc') {
      return <p className="text-xs text-faint leading-relaxed mb-0" {...props}>{children}</p>;
    }
    // Highlight box
    if (className === 'highlight-box') {
      return (
        <div className="my-8 bg-acc-deep rounded-xl border border-acc/25 p-6" {...props}>
          {children}
        </div>
      );
    }
    // Stats row
    if (className === 'stats-row') {
      return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6" {...props}>{children}</div>;
    }
    // Stat card
    if (className === 'stat-card') {
      return (
        <div className="bg-surface rounded-lg border border-line p-4 text-center" {...props}>
          {children}
        </div>
      );
    }
    // Stat value
    if (className === 'stat-value') {
      return <div className="text-xl font-bold text-acc mb-0.5" {...props}>{children}</div>;
    }
    // Stat label
    if (className === 'stat-label') {
      return <div className="text-[10px] text-faint uppercase tracking-wider font-semibold" {...props}>{children}</div>;
    }
    // Verdict / summary box
    if (className === 'verdict-box') {
      return (
        <div className="my-8 bg-mint/10 rounded-xl border border-mint/30 p-6" {...props}>
          {children}
        </div>
      );
    }
    // CTA box
    if (className === 'cta-box') {
      return (
        <div className="my-8 bg-gradient-to-r from-acc to-acc-2 rounded-xl p-6 text-center" {...props}>
          {children}
        </div>
      );
    }
    // Two-column comparison
    if (className === 'vs-grid') {
      return <div className="grid sm:grid-cols-2 gap-4 my-8" {...props}>{children}</div>;
    }
    if (className === 'vs-card') {
      return (
        <div className="bg-surface rounded-xl border border-line p-5" {...props}>
          {children}
        </div>
      );
    }
    if (className === 'vs-title') {
      return <h4 className="text-base font-bold text-ink mb-3 pb-2 border-b border-line" {...props}>{children}</h4>;
    }
    // Default div
    return <div className={className} {...props}>{children}</div>;
  },

  span: ({ className, children, ...props }) => {
    if (className === 'cta-link') {
      return <span className="inline-block mt-3" {...props}>{children}</span>;
    }
    if (className === 'cta-text') {
      return <span className="text-white/70 text-sm block mb-3" {...props}>{children}</span>;
    }
    if (className === 'cta-heading') {
      return <span className="text-white text-lg font-bold block mb-1" {...props}>{children}</span>;
    }
    return <span className={className} {...props}>{children}</span>;
  },
};

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** Extract h2 headings from Markdown content for TOC */
export function extractHeadings(content: string): { text: string; id: string }[] {
  const headings: { text: string; id: string }[] = [];
  const regex = /^## (.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    headings.push({ text, id });
  }
  return headings;
}
