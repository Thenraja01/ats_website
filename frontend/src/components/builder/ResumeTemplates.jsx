import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  Languages as LanguagesIcon,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  Trophy,
  Layers,
  Link as LinkIcon
} from 'lucide-react';

/**
 * Dynamic Font Family Resolver
 */
export const getFontFamilyStyle = (font = 'inter') => {
  if (!font) return { fontFamily: '"Inter", sans-serif' };

  // If a full CSS fontFamily string was passed (e.g. "'Poppins', sans-serif")
  if (font.includes(',') || font.includes("'") || font.includes('"')) {
    return { fontFamily: font };
  }

  const normalized = font.toLowerCase().trim();
  switch (normalized) {
    case 'poppins':
      return { fontFamily: "'Poppins', sans-serif" };
    case 'playfair':
    case 'playfair-display':
      return { fontFamily: "'Playfair Display', Georgia, serif" };
    case 'pacifico':
      return { fontFamily: "'Pacifico', cursive" };
    case 'caveat':
      return { fontFamily: "'Caveat', cursive" };
    case 'dancing-script':
      return { fontFamily: "'Dancing Script', cursive" };
    case 'merriweather':
      return { fontFamily: "'Merriweather', Georgia, Cambria, serif" };
    case 'lora':
      return { fontFamily: "'Lora', Georgia, serif" };
    case 'eb-garamond':
      return { fontFamily: "'EB Garamond', Georgia, serif" };
    case 'georgia':
      return { fontFamily: "Georgia, serif" };
    case 'times':
    case 'times-new-roman':
      return { fontFamily: "'Times New Roman', Times, serif" };
    case 'mono':
    case 'jetbrains':
    case 'jetbrains-mono':
      return { fontFamily: "'JetBrains Mono', monospace" };
    case 'fira-code':
      return { fontFamily: "'Fira Code', monospace" };
    case 'space-grotesk':
      return { fontFamily: "'Space Grotesk', sans-serif" };
    case 'outfit':
      return { fontFamily: "'Outfit', sans-serif" };
    case 'roboto':
      return { fontFamily: "'Roboto', sans-serif" };
    case 'open-sans':
      return { fontFamily: "'Open Sans', sans-serif" };
    case 'lato':
      return { fontFamily: "'Lato', sans-serif" };
    case 'montserrat':
      return { fontFamily: "'Montserrat', sans-serif" };
    case 'plus-jakarta-sans':
      return { fontFamily: "'Plus Jakarta Sans', sans-serif" };
    case 'calibri':
      return { fontFamily: "Calibri, 'Segoe UI', sans-serif" };
    case 'arial':
      return { fontFamily: "Arial, sans-serif" };
    case 'inter':
    default:
      return { fontFamily: "'Inter', sans-serif" };
  }
};

/**
 * Dynamic Numeric Styling Resolver
 */
export const getDynamicStyles = (options = {}) => {
  const baseSize = typeof options.fontSizeNum === 'number'
    ? options.fontSizeNum
    : (options.fontSize === 'small' ? 9.5 : (options.fontSize === 'large' ? 12 : 10.5));

  const lineHeight = typeof options.lineHeight === 'number'
    ? options.lineHeight
    : (options.spacing === 'compact' ? 1.3 : (options.spacing === 'relaxed' ? 1.65 : 1.45));

  const pagePadding = typeof options.pagePadding === 'number'
    ? `${options.pagePadding}px`
    : (options.spacing === 'compact' ? '24px' : (options.spacing === 'relaxed' ? '40px' : '32px'));

  const sectionGap = typeof options.sectionGap === 'number'
    ? `${options.sectionGap}px`
    : (options.spacing === 'compact' ? '12px' : (options.spacing === 'relaxed' ? '22px' : '16px'));

  const itemGap = typeof options.itemGap === 'number'
    ? `${options.itemGap}px`
    : (options.spacing === 'compact' ? '6px' : (options.spacing === 'relaxed' ? '14px' : '10px'));

  const borderRadius = typeof options.borderRadius === 'number'
    ? `${options.borderRadius}px`
    : '6px';

  return {
    baseSize: `${baseSize}pt`,
    titleSize: `${baseSize * 1.1}pt`,
    headingSize: `${baseSize * 1.75}pt`,
    sectionHeadingSize: `${baseSize * 1.05}pt`,
    subSize: `${baseSize * 0.9}pt`,
    microSize: `${baseSize * 0.8}pt`,
    lineHeight,
    pagePadding,
    sectionGap,
    itemGap,
    borderRadius
  };
};

/**
 * Dynamic Bullet symbol renderer
 */
export const renderBulletIcon = (style = 'disc', color = '#4F8CFF') => {
  switch (style) {
    case 'dash':
      return <span className="mr-1.5 font-bold text-slate-500 select-none leading-none">—</span>;
    case 'arrow':
      return <span className="mr-1.5 font-bold select-none leading-none" style={{ color }}>›</span>;
    case 'check':
      return <span className="mr-1.5 font-bold text-emerald-500 select-none leading-none">✓</span>;
    case 'square':
      return <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-[1px] bg-slate-400 align-middle mb-0.5 select-none"></span>;
    case 'diamond':
      return <span className="mr-1.5 font-bold select-none leading-none" style={{ color }}>◆</span>;
    case 'star':
      return <span className="mr-1.5 font-bold select-none leading-none" style={{ color }}>★</span>;
    case 'disc':
    default:
      return <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-slate-500 align-middle mb-0.5 select-none"></span>;
  }
};

/**
 * Template 1: Modern Professional (Clean 2-Column layout with Accent Bar)
 */
export function ModernTemplate({ data, color = '#4F8CFF', options = {} }) {
  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    projects = [],
    skills = [],
    certifications = [],
    achievements = [],
    languages = [],
    customSections = [],
  } = data || {};

  const {
    fontFamily = 'inter',
    bulletStyle = 'disc',
    headerLayout = 'left',
    showAvatar = true,
    hiddenSections = []
  } = options;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const s = getDynamicStyles(options);
  const isVisible = (secId) => !hiddenSections.includes(secId);

  return (
    <div
      className="w-full bg-primary text-slate-800 shadow-sm min-h-[1123px] box-border"
      style={{ ...fontStyle, padding: s.pagePadding, fontSize: s.baseSize, lineHeight: s.lineHeight }}
    >
      {/* Header */}
      <div
        className={`border-b-2 pb-4 mb-4 ${headerLayout === 'center' ? 'text-center' : ''}`}
        style={{ borderColor: color }}
      >
        <div className={`flex ${headerLayout === 'center' ? 'flex-col items-center' : 'justify-between items-start'}`}>
          <div>
            <h1 className="font-bold tracking-tight text-slate-900" style={{ fontSize: s.headingSize }}>
              {personalInfo.fullName || 'Candidate Full Name'}
            </h1>
            <p className="font-semibold mt-0.5" style={{ color, fontSize: s.titleSize }}>
              {personalInfo.title || 'Professional Title / Target Role'}
            </p>
          </div>
          {showAvatar && personalInfo.avatar && (
            <img
              src={personalInfo.avatar}
              alt={personalInfo.fullName}
              className="w-14 h-14 rounded-full object-cover border border-slate-200 mt-2 sm:mt-0"
            />
          )}
        </div>

        {/* Contact Info Pills + Custom Fields */}
        <div
          className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2.5 text-slate-600 ${headerLayout === 'center' ? 'justify-center' : ''}`}
          style={{ fontSize: s.subSize }}
        >
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.website}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.linkedin}
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <Github className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.github}
            </span>
          )}
          {personalInfo.customFields && personalInfo.customFields.map((cf, cIdx) => (
            cf.label && cf.value && (
              <span key={cf.id || cIdx} className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-700">{cf.label}:</span>
                <span>{cf.value}</span>
              </span>
            )
          ))}
        </div>
      </div>

      {/* Summary */}
      {isVisible('summary') && summary && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2
            className="font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
            style={{ color, fontSize: s.sectionHeadingSize }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Professional Summary
          </h2>
          <p className="text-slate-700 primaryspace-pre-line leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Grid 2 Column for Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column (Experience, Projects) */}
        <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: s.sectionGap }}>

          {/* Work Experience */}
          {isVisible('experience') && experience && experience.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5"
                style={{ color, fontSize: s.sectionHeadingSize }}
              >
                <Briefcase className="w-3.5 h-3.5" /> Work Experience
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{exp.position}</span>
                      <span className="font-medium text-slate-500" style={{ fontSize: s.microSize }}>
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="font-semibold" style={{ color, fontSize: s.subSize }}>
                      {exp.company} {exp.location ? `• ${exp.location}` : ''}
                    </div>
                    {exp.description && (
                      <p className="text-slate-700 mt-0.5" style={{ fontSize: s.subSize }}>{exp.description}</p>
                    )}
                    {exp.bullets && (
                      <ul className="text-slate-700 mt-1 space-y-0.5" style={{ fontSize: s.subSize }}>
                        {exp.bullets.filter(b => b && b.trim()).map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start">
                            {renderBulletIcon(bulletStyle, color)}
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Projects */}
          {isVisible('projects') && projects && projects.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5"
                style={{ color, fontSize: s.sectionHeadingSize }}
              >
                <Code2 className="w-3.5 h-3.5" /> Key Projects
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{proj.name}</span>
                      {proj.period && (
                        <span className="text-slate-500" style={{ fontSize: s.microSize }}>{proj.period}</span>
                      )}
                    </div>
                    {proj.technologies && (
                      <div className="font-medium" style={{ color, fontSize: s.microSize }}>
                        Stack: {proj.technologies}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-slate-700 mt-0.5" style={{ fontSize: s.subSize }}>{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Column (Skills, Education, Certs, Languages, Custom Sections) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.sectionGap }}>

          {/* Skills */}
          {isVisible('skills') && skills && skills.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5"
                style={{ color, fontSize: s.sectionHeadingSize }}
              >
                <Award className="w-3.5 h-3.5" /> Skills & Competencies
              </h2>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-800 font-medium"
                    style={{ fontSize: s.microSize, borderRadius: s.borderRadius }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {isVisible('education') && education && education.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5"
                style={{ color, fontSize: s.sectionHeadingSize }}
              >
                <BookOpen className="w-3.5 h-3.5" /> Education
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-700" style={{ fontSize: s.subSize }}>{edu.institution}</div>
                    <div className="text-slate-500" style={{ fontSize: s.microSize }}>
                      {edu.startYear} – {edu.endYear || 'Present'} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {isVisible('certifications') && certifications && certifications.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5"
                style={{ color, fontSize: s.sectionHeadingSize }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Certifications
              </h2>
              <div className="space-y-1.5" style={{ fontSize: s.subSize }}>
                {certifications.map((cert, idx) => (
                  <div key={idx}>
                    <div className="font-semibold text-slate-900">{cert.name}</div>
                    <div className="text-slate-500" style={{ fontSize: s.microSize }}>
                      {cert.issuer} {cert.year ? `• ${cert.year}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {isVisible('languages') && languages && languages.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5"
                style={{ color, fontSize: s.sectionHeadingSize }}
              >
                <LanguagesIcon className="w-3.5 h-3.5" /> Languages
              </h2>
              <div className="space-y-1" style={{ fontSize: s.subSize }}>
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="font-medium text-slate-800">{lang.name}</span>
                    <span className="text-slate-500" style={{ fontSize: s.microSize }}>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {isVisible('customSections') && customSections && customSections.length > 0 && customSections.map((sec, sIdx) => (
            sec.title && (
              <div key={sec.id || sIdx}>
                <h2
                  className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5"
                  style={{ color, fontSize: s.sectionHeadingSize }}
                >
                  <Layers className="w-3.5 h-3.5" /> {sec.title}
                </h2>
                {sec.content && <p className="text-slate-700 primaryspace-pre-line" style={{ fontSize: s.subSize }}>{sec.content}</p>}
                {sec.items && sec.items.length > 0 && (
                  <ul className="space-y-1 text-slate-700 mt-1" style={{ fontSize: s.subSize }}>
                    {sec.items.filter(it => typeof it === 'string' ? it.trim() : it?.text?.trim()).map((it, itIdx) => (
                      <li key={itIdx} className="flex items-start">
                        {renderBulletIcon(bulletStyle, color)}
                        <span>{typeof it === 'string' ? it : (it.title ? <strong>{it.title}: </strong> : '') + (it.text || it.description || '')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Template 2: Minimalist Single-Column ATS
 */
export function MinimalTemplate({ data, color = '#1E293B', options = {} }) {
  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    projects = [],
    skills = [],
    certifications = [],
    languages = [],
    customSections = [],
  } = data || {};

  const {
    fontFamily = 'merriweather',
    bulletStyle = 'disc',
    hiddenSections = []
  } = options;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const s = getDynamicStyles(options);
  const isVisible = (secId) => !hiddenSections.includes(secId);

  return (
    <div
      className="w-full bg-primary text-slate-900 shadow-sm min-h-[1123px] box-border"
      style={{ ...fontStyle, padding: s.pagePadding, fontSize: s.baseSize, lineHeight: s.lineHeight }}
    >
      {/* Header Minimal */}
      <div className="text-center pb-3 mb-3 border-b border-slate-300">
        <h1 className="font-bold uppercase tracking-wider text-slate-950 font-sans" style={{ fontSize: s.headingSize }}>
          {personalInfo.fullName || 'Candidate Name'}
        </h1>
        <p className="font-medium text-slate-600 mt-0.5 uppercase tracking-widest font-sans" style={{ fontSize: s.subSize }}>
          {personalInfo.title || 'Professional Title / Specialization'}
        </p>

        <div
          className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5 mt-1.5 text-slate-600 font-sans"
          style={{ fontSize: s.subSize }}
        >
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.email && <span>• {personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
          {personalInfo.github && <span>• {personalInfo.github}</span>}
          {personalInfo.customFields && personalInfo.customFields.map((cf, cIdx) => (
            cf.label && cf.value && (
              <span key={cf.id || cIdx}>• {cf.label}: {cf.value}</span>
            )
          ))}
        </div>
      </div>

      {/* Summary */}
      {isVisible('summary') && summary && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1" style={{ fontSize: s.sectionHeadingSize }}>
            Professional Summary
          </h2>
          <p className="text-slate-800 text-justify">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {isVisible('experience') && experience && experience.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5" style={{ fontSize: s.sectionHeadingSize }}>
            Work Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
            {experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{exp.position}, <span className="font-semibold text-slate-700">{exp.company}</span></span>
                  <span className="font-normal text-slate-600" style={{ fontSize: s.microSize }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.bullets && (
                  <ul className="space-y-0.5 text-slate-800 mt-1" style={{ fontSize: s.subSize }}>
                    {exp.bullets.filter(b => b && b.trim()).map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start">
                        {renderBulletIcon(bulletStyle, color)}
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {isVisible('projects') && projects && projects.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5" style={{ fontSize: s.sectionHeadingSize }}>
            Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
            {projects.map((p, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{p.name} {p.technologies ? <span className="font-normal text-slate-600">({p.technologies})</span> : ''}</span>
                  {p.period && <span className="font-normal text-slate-500" style={{ fontSize: s.microSize }}>{p.period}</span>}
                </div>
                {p.description && <p className="text-slate-800 mt-0.5" style={{ fontSize: s.subSize }}>{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {isVisible('education') && education && education.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5" style={{ fontSize: s.sectionHeadingSize }}>
            Education
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span> — <span className="text-slate-700">{edu.degree}</span>
                </div>
                <span className="text-slate-600" style={{ fontSize: s.microSize }}>
                  {edu.startYear} – {edu.endYear || 'Present'} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {isVisible('skills') && skills && skills.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1" style={{ fontSize: s.sectionHeadingSize }}>
            Technical Skills
          </h2>
          <p className="text-slate-800" style={{ fontSize: s.subSize }}>
            {skills.join(' • ')}
          </p>
        </div>
      )}

      {/* Custom Sections */}
      {isVisible('customSections') && customSections && customSections.length > 0 && customSections.map((sec, sIdx) => (
        sec.title && (
          <div key={sec.id || sIdx} style={{ marginBottom: s.sectionGap }}>
            <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1" style={{ fontSize: s.sectionHeadingSize }}>
              {sec.title}
            </h2>
            {sec.content && <p className="text-slate-800 primaryspace-pre-line" style={{ fontSize: s.subSize }}>{sec.content}</p>}
            {sec.items && sec.items.length > 0 && (
              <ul className="space-y-0.5 text-slate-800" style={{ fontSize: s.subSize }}>
                {sec.items.filter(it => typeof it === 'string' ? it.trim() : it?.text?.trim()).map((it, itIdx) => (
                  <li key={itIdx} className="flex items-start">
                    {renderBulletIcon(bulletStyle, color)}
                    <span>{typeof it === 'string' ? it : (it.title ? <strong>{it.title}: </strong> : '') + (it.text || it.description || '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      ))}
    </div>
  );
}

/**
 * Template 3: Executive Leadership
 */
export function ExecutiveTemplate({ data, color = '#0F172A', options = {} }) {
  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    projects = [],
    skills = [],
    certifications = [],
    languages = [],
    customSections = [],
  } = data || {};

  const {
    fontFamily = 'outfit',
    bulletStyle = 'square',
    hiddenSections = []
  } = options;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const s = getDynamicStyles(options);
  const isVisible = (secId) => !hiddenSections.includes(secId);

  return (
    <div
      className="w-full bg-primary text-slate-900 shadow-sm min-h-[1123px] box-border"
      style={{ ...fontStyle, padding: s.pagePadding, fontSize: s.baseSize, lineHeight: s.lineHeight }}
    >
      {/* Executive Header */}
      <div className="border-b-4 pb-3 mb-4" style={{ borderColor: color }}>
        <h1 className="font-extrabold tracking-tight text-slate-900" style={{ fontSize: s.headingSize }}>
          {personalInfo.fullName || 'Executive Candidate'}
        </h1>
        <p className="font-semibold text-slate-600 mt-0.5 uppercase tracking-widest" style={{ fontSize: s.titleSize }}>
          {personalInfo.title || 'Senior Technology Leader'}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-slate-600" style={{ fontSize: s.subSize }}>
          {personalInfo.email && <span>Email: {personalInfo.email}</span>}
          {personalInfo.phone && <span>Phone: {personalInfo.phone}</span>}
          {personalInfo.location && <span>Location: {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>LinkedIn: {personalInfo.linkedin}</span>}
          {personalInfo.customFields && personalInfo.customFields.map((cf, cIdx) => (
            cf.label && cf.value && (
              <span key={cf.id || cIdx}>{cf.label}: {cf.value}</span>
            )
          ))}
        </div>
      </div>

      {/* Summary */}
      {isVisible('summary') && summary && (
        <div
          className="bg-slate-50 p-3 rounded-lg border-l-4"
          style={{ borderColor: color, marginBottom: s.sectionGap, borderRadius: s.borderRadius }}
        >
          <h2 className="font-bold uppercase tracking-wider text-slate-900 mb-0.5" style={{ fontSize: s.sectionHeadingSize }}>
            Executive Profile & Value Proposition
          </h2>
          <p className="text-slate-700 text-justify">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {isVisible('experience') && experience && experience.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-0.5 mb-2" style={{ fontSize: s.sectionHeadingSize }}>
            Leadership & Career History
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900">{exp.position}</h3>
                  <span className="font-semibold text-slate-600" style={{ fontSize: s.microSize }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="font-medium text-slate-700" style={{ fontSize: s.subSize }}>
                  {exp.company} {exp.location ? `• ${exp.location}` : ''}
                </div>
                {exp.description && <p className="text-slate-700" style={{ fontSize: s.subSize }}>{exp.description}</p>}
                {exp.bullets && (
                  <ul className="space-y-0.5 text-slate-700 mt-1" style={{ fontSize: s.subSize }}>
                    {exp.bullets.filter(b => b && b.trim()).map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start">
                        {renderBulletIcon(bulletStyle, color)}
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {isVisible('skills') && skills && skills.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-0.5 mb-2" style={{ fontSize: s.sectionHeadingSize }}>
            Core Competencies & Domain Expertise
          </h2>
          <div className="grid grid-cols-3 gap-1.5" style={{ fontSize: s.subSize }}>
            {skills.map((skill, idx) => (
              <div key={idx} className="text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {isVisible('customSections') && customSections && customSections.length > 0 && customSections.map((sec, sIdx) => (
        sec.title && (
          <div key={sec.id || sIdx} style={{ marginBottom: s.sectionGap }}>
            <h2 className="font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-0.5 mb-1.5" style={{ fontSize: s.sectionHeadingSize }}>
              {sec.title}
            </h2>
            {sec.content && <p className="text-slate-700 primaryspace-pre-line" style={{ fontSize: s.subSize }}>{sec.content}</p>}
            {sec.items && sec.items.length > 0 && (
              <ul className="space-y-0.5 text-slate-700" style={{ fontSize: s.subSize }}>
                {sec.items.filter(it => typeof it === 'string' ? it.trim() : it?.text?.trim()).map((it, itIdx) => (
                  <li key={itIdx} className="flex items-start">
                    {renderBulletIcon(bulletStyle, color)}
                    <span>{typeof it === 'string' ? it : (it.title ? <strong>{it.title}: </strong> : '') + (it.text || it.description || '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      ))}
    </div>
  );
}

/**
 * Template 4: Creative Technologist (Dark Sidebar)
 */
export function CreativeTemplate({ data, color = '#6366F1', options = {} }) {
  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    projects = [],
    skills = [],
    certifications = [],
    languages = [],
    customSections = [],
  } = data || {};

  const {
    fontFamily = 'inter',
    bulletStyle = 'arrow',
    showAvatar = true,
    hiddenSections = []
  } = options;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const s = getDynamicStyles(options);
  const isVisible = (secId) => !hiddenSections.includes(secId);

  return (
    <div
      className="w-full bg-slate-50 text-slate-800 shadow-sm min-h-[1123px] flex box-border"
      style={{ ...fontStyle, fontSize: s.baseSize, lineHeight: s.lineHeight }}
    >
      {/* Left Sidebar */}
      <div
        className="w-1/3 bg-[#0C1222] text-primary space-y-4"
        style={{ padding: s.pagePadding }}
      >
        <div>
          {showAvatar && personalInfo.avatar && (
            <img
              src={personalInfo.avatar}
              alt={personalInfo.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 mb-3"
            />
          )}
          <h1 className="font-bold tracking-tight text-primary" style={{ fontSize: s.headingSize }}>
            {personalInfo.fullName || 'Creative Candidate'}
          </h1>
          <p className="font-medium mt-0.5" style={{ color, fontSize: s.titleSize }}>
            {personalInfo.title || 'Senior Technologist'}
          </p>
        </div>

        {/* Contact Links */}
        <div className="space-y-1.5 text-slate-300 border-t border-slate-800 pt-3" style={{ fontSize: s.microSize }}>
          {personalInfo.email && <div className="break-all">{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.github && <div className="break-all">{personalInfo.github}</div>}
          {personalInfo.linkedin && <div className="break-all">{personalInfo.linkedin}</div>}
          {personalInfo.customFields && personalInfo.customFields.map((cf, cIdx) => (
            cf.label && cf.value && (
              <div key={cf.id || cIdx} className="break-all">{cf.label}: {cf.value}</div>
            )
          ))}
        </div>

        {/* Skills */}
        {isVisible('skills') && skills && skills.length > 0 && (
          <div className="border-t border-slate-800 pt-3">
            <h3 className="font-bold uppercase tracking-wider mb-2" style={{ color, fontSize: s.sectionHeadingSize }}>Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-800 text-slate-200"
                  style={{ fontSize: s.microSize, borderRadius: s.borderRadius }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {isVisible('education') && education && education.length > 0 && (
          <div className="border-t border-slate-800 pt-3">
            <h3 className="font-bold uppercase tracking-wider mb-2" style={{ color, fontSize: s.sectionHeadingSize }}>Education</h3>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <div className="font-bold text-primary" style={{ fontSize: s.subSize }}>{edu.degree}</div>
                  <div className="text-slate-400" style={{ fontSize: s.microSize }}>{edu.institution}</div>
                  <div className="text-slate-500" style={{ fontSize: s.microSize }}>{edu.startYear} – {edu.endYear || 'Present'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div
        className="w-2/3 bg-primary"
        style={{ padding: s.pagePadding, display: 'flex', flexDirection: 'column', gap: s.sectionGap }}
      >
        {isVisible('summary') && summary && (
          <div>
            <h2 className="font-bold uppercase tracking-wider mb-1" style={{ color, fontSize: s.sectionHeadingSize }}>About Me</h2>
            <p className="text-slate-700 leading-relaxed" style={{ fontSize: s.subSize }}>{summary}</p>
          </div>
        )}

        {isVisible('experience') && experience && experience.length > 0 && (
          <div>
            <h2 className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-100" style={{ color, fontSize: s.sectionHeadingSize }}>
              Work Experience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.position}</span>
                    <span className="text-slate-500 font-normal" style={{ fontSize: s.microSize }}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="font-semibold" style={{ color, fontSize: s.subSize }}>{exp.company}</div>
                  {exp.bullets && (
                    <ul className="space-y-0.5 text-slate-700 mt-1" style={{ fontSize: s.subSize }}>
                      {exp.bullets.filter(b => b && b.trim()).map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start">
                          {renderBulletIcon(bulletStyle, color)}
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isVisible('projects') && projects && projects.length > 0 && (
          <div>
            <h2 className="font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-100" style={{ color, fontSize: s.sectionHeadingSize }}>
              Featured Projects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-900 flex justify-between">
                    <span>{proj.name}</span>
                    {proj.period && <span className="text-slate-500 font-normal" style={{ fontSize: s.microSize }}>{proj.period}</span>}
                  </div>
                  {proj.technologies && <div className="font-medium" style={{ color, fontSize: s.microSize }}>Stack: {proj.technologies}</div>}
                  {proj.description && <p className="text-slate-700 mt-0.5" style={{ fontSize: s.subSize }}>{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Sections */}
        {isVisible('customSections') && customSections && customSections.length > 0 && customSections.map((sec, sIdx) => (
          sec.title && (
            <div key={sec.id || sIdx}>
              <h2 className="font-bold uppercase tracking-wider mb-1 pb-1 border-b border-slate-100" style={{ color, fontSize: s.sectionHeadingSize }}>
                {sec.title}
              </h2>
              {sec.content && <p className="text-slate-700 primaryspace-pre-line" style={{ fontSize: s.subSize }}>{sec.content}</p>}
              {sec.items && sec.items.length > 0 && (
                <ul className="space-y-0.5 text-slate-700 mt-1" style={{ fontSize: s.subSize }}>
                  {sec.items.filter(it => typeof it === 'string' ? it.trim() : it?.text?.trim()).map((it, itIdx) => (
                    <li key={itIdx} className="flex items-start">
                      {renderBulletIcon(bulletStyle, color)}
                      <span>{typeof it === 'string' ? it : (it.title ? <strong>{it.title}: </strong> : '') + (it.text || it.description || '')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
}

/**
 * Template 5: Tech Single-Column (Silicon Valley / Stanford Engineering Format)
 */
export function TechSingleColumnTemplate({ data, color = '#2563EB', options = {} }) {
  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    projects = [],
    skills = [],
    certifications = [],
    customSections = [],
  } = data || {};

  const {
    fontFamily = 'mono',
    bulletStyle = 'dash',
    hiddenSections = []
  } = options;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const s = getDynamicStyles(options);
  const isVisible = (secId) => !hiddenSections.includes(secId);

  return (
    <div
      className="w-full bg-primary text-slate-900 shadow-sm min-h-[1123px] box-border"
      style={{ ...fontStyle, padding: s.pagePadding, fontSize: s.baseSize, lineHeight: s.lineHeight }}
    >
      {/* Top Header */}
      <div className="text-center pb-2.5 mb-3 border-b-2" style={{ borderColor: color }}>
        <h1 className="font-bold tracking-tight text-slate-950 uppercase" style={{ fontSize: s.headingSize }}>
          {personalInfo.fullName || 'Candidate Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-slate-600 font-sans" style={{ fontSize: s.subSize }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.github && <span>• {personalInfo.github}</span>}
          {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
          {personalInfo.customFields && personalInfo.customFields.map((cf, cIdx) => (
            cf.label && cf.value && (
              <span key={cf.id || cIdx}>• {cf.label}: {cf.value}</span>
            )
          ))}
        </div>
      </div>

      {/* Skills at top for high-impact tech screening */}
      {isVisible('skills') && skills && skills.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-wider pb-0.5 border-b border-slate-300 mb-1" style={{ color, fontSize: s.sectionHeadingSize }}>
            Technical Expertise
          </h2>
          <p className="text-slate-800 font-sans" style={{ fontSize: s.subSize }}>
            <strong>Core Technologies & Frameworks:</strong> {skills.join(', ')}
          </p>
        </div>
      )}

      {/* Experience */}
      {isVisible('experience') && experience && experience.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-wider pb-0.5 border-b border-slate-300 mb-1.5" style={{ color, fontSize: s.sectionHeadingSize }}>
            Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5 font-sans">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{exp.company} <span className="font-semibold text-slate-700">| {exp.position}</span></span>
                  <span className="font-medium text-slate-500" style={{ fontSize: s.microSize }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.bullets && (
                  <ul className="space-y-0.5 text-slate-800 mt-0.5" style={{ fontSize: s.subSize }}>
                    {exp.bullets.filter(b => b && b.trim()).map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start">
                        {renderBulletIcon(bulletStyle, color)}
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {isVisible('projects') && projects && projects.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-wider pb-0.5 border-b border-slate-300 mb-1.5" style={{ color, fontSize: s.sectionHeadingSize }}>
            Engineering Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
            {projects.map((p, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{p.name} {p.technologies ? <span className="font-normal text-slate-600">({p.technologies})</span> : ''}</span>
                  {p.period && <span className="font-medium text-slate-500" style={{ fontSize: s.microSize }}>{p.period}</span>}
                </div>
                {p.description && <p className="text-slate-700 mt-0.5 font-sans" style={{ fontSize: s.subSize }}>{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {isVisible('education') && education && education.length > 0 && (
        <div style={{ marginBottom: s.sectionGap }}>
          <h2 className="font-bold uppercase tracking-wider pb-0.5 border-b border-slate-300 mb-1" style={{ color, fontSize: s.sectionHeadingSize }}>
            Education
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemGap }}>
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline font-sans">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span> — <span className="text-slate-700">{edu.degree}</span>
                </div>
                <span className="text-slate-600" style={{ fontSize: s.microSize }}>
                  {edu.startYear} – {edu.endYear || 'Present'} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {isVisible('customSections') && customSections && customSections.length > 0 && customSections.map((sec, sIdx) => (
        sec.title && (
          <div key={sec.id || sIdx} style={{ marginBottom: s.sectionGap }}>
            <h2 className="font-bold uppercase tracking-wider pb-0.5 border-b border-slate-300 mb-1" style={{ color, fontSize: s.sectionHeadingSize }}>
              {sec.title}
            </h2>
            {sec.content && <p className="text-slate-800 primaryspace-pre-line" style={{ fontSize: s.subSize }}>{sec.content}</p>}
            {sec.items && sec.items.length > 0 && (
              <ul className="space-y-0.5 text-slate-800 font-sans" style={{ fontSize: s.subSize }}>
                {sec.items.filter(it => typeof it === 'string' ? it.trim() : it?.text?.trim()).map((it, itIdx) => (
                  <li key={itIdx} className="flex items-start">
                    {renderBulletIcon(bulletStyle, color)}
                    <span>{typeof it === 'string' ? it : (it.title ? <strong>{it.title}: </strong> : '') + (it.text || it.description || '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      ))}
    </div>
  );
}
