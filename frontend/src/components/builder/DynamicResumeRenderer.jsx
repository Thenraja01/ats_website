import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink, Calendar } from 'lucide-react';

/**
 * DynamicResumeRenderer
 * Interprets a declarative JSON AST Layout Specification from the MongoDB Template Catalog
 * and renders an ATS-safe, print-perfect resume document.
 */
export default function DynamicResumeRenderer({
  data = {},
  template = null,
  color = null,
  options = {},
}) {
  const personal = data.personalInfo || {};
  const summary = data.summary || '';
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const languages = data.languages || [];
  const customSections = data.customSections || [];

  // Extract AST settings with fallback defaults
  const typography = template?.typography || {};
  const palette = template?.palette || {};
  const layout = template?.layout || {};

  const primaryColor = color || palette.primary || '#2563EB';
  const secondaryColor = palette.secondary || '#3B82F6';
  const textPrimary = palette.textPrimary || '#0F172A';
  const textMuted = palette.textMuted || '#64748B';
  const borderColor = palette.borderColor || '#E2E8F0';

  const fontFamily = options.fontFamily || typography.fontFamily || 'Inter, sans-serif';
  const baseSizePt = options.fontSizeNum || typography.baseSizePt || 10.0;
  const lineHeightVal = options.lineHeight || typography.lineHeight || 1.45;
  const pageMarginPx = options.pagePadding || layout.pageMarginPx || 32;
  const sectionGapPx = options.sectionGap || layout.sectionGapPx || 16;
  const itemGapPx = options.itemGap || layout.itemGapPx || 8;
  const borderRadiusPx = options.borderRadius !== undefined ? options.borderRadius : (layout.borderRadiusPx || 4);
  const bulletStyle = options.bulletStyle || layout.bulletStyle || 'disc';
  const headerAlign = options.headerLayout || layout.headerAlign || 'left';

  const layoutType = layout.layoutType || 'single_column';
  const zones = layout.zones && layout.zones.length > 0 ? layout.zones : [
    { id: 'header', widthPct: 100, sections: ['personal'] },
    { id: 'main', widthPct: 100, sections: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'] }
  ];

  // Helper: Section Title Component
  const renderSectionHeading = (title) => (
    <div className="pb-1 mb-2 border-b flex items-center justify-between" style={{ borderColor }}>
      <h3
        className="font-bold uppercase tracking-wider text-xs"
        style={{ color: primaryColor }}
      >
        {title}
      </h3>
      <span className="h-0.5 w-6 rounded-full" style={{ backgroundColor: primaryColor }} />
    </div>
  );

  // Section: Personal Header
  const renderPersonalSection = () => (
    <div
      className={`space-y-2 ${headerAlign === 'center' ? 'text-center' : headerAlign === 'right' ? 'text-right' : 'text-left'}`}
    >
      <h1
        className="text-2xl font-black tracking-tight"
        style={{ color: textPrimary }}
      >
        {personal.fullName || 'Your Full Name'}
      </h1>
      {personal.title && (
        <p className="text-sm font-semibold tracking-wide" style={{ color: primaryColor }}>
          {personal.title}
        </p>
      )}

      {/* Contact Details Line */}
      <div
        className={`flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1 ${
          headerAlign === 'center' ? 'justify-center' : headerAlign === 'right' ? 'justify-end' : 'justify-start'
        }`}
        style={{ color: textMuted }}
      >
        {personal.email && (
          <span className="inline-flex items-center gap-1">
            <Mail className="size-3" style={{ color: primaryColor }} />
            {personal.email}
          </span>
        )}
        {personal.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="size-3" style={{ color: primaryColor }} />
            {personal.phone}
          </span>
        )}
        {personal.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" style={{ color: primaryColor }} />
            {personal.location}
          </span>
        )}
        {personal.linkedin && (
          <span className="inline-flex items-center gap-1">
            <Linkedin className="size-3" style={{ color: primaryColor }} />
            {personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
          </span>
        )}
        {personal.github && (
          <span className="inline-flex items-center gap-1">
            <Github className="size-3" style={{ color: primaryColor }} />
            {personal.github.replace(/^https?:\/\/(www\.)?/, '')}
          </span>
        )}
        {personal.website && (
          <span className="inline-flex items-center gap-1">
            <Globe className="size-3" style={{ color: primaryColor }} />
            {personal.website.replace(/^https?:\/\/(www\.)?/, '')}
          </span>
        )}
      </div>
    </div>
  );

  // Section: Summary
  const renderSummarySection = () => {
    if (!summary) return null;
    return (
      <div className="space-y-1">
        {renderSectionHeading('Professional Summary')}
        <p className="text-xs leading-relaxed text-justify" style={{ color: textPrimary }}>
          {summary}
        </p>
      </div>
    );
  };

  // Section: Experience
  const renderExperienceSection = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <div className="space-y-3">
        {renderSectionHeading('Work Experience')}
        <div className="space-y-3" style={{ gap: `${itemGapPx}px` }}>
          {experience.map((exp, idx) => (
            <div key={exp.id || idx} className="space-y-1">
              <div className="flex justify-between items-baseline flex-wrap gap-1">
                <span className="text-xs font-bold" style={{ color: textPrimary }}>
                  {exp.position || exp.role || 'Role Title'}
                </span>
                <span className="text-[11px] font-medium" style={{ color: textMuted }}>
                  {exp.startDate} {exp.startDate && exp.endDate ? '–' : ''} {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-semibold" style={{ color: primaryColor }}>
                  {exp.company}
                </span>
                {exp.location && (
                  <span className="text-[11px]" style={{ color: textMuted }}>
                    {exp.location}
                  </span>
                )}
              </div>
              {exp.description && (
                <p className="text-xs leading-relaxed" style={{ color: textPrimary }}>
                  {exp.description}
                </p>
              )}
              {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                <ul
                  className="space-y-1 mt-1 text-xs pl-4"
                  style={{
                    listStyleType: bulletStyle === 'dash' ? 'none' : bulletStyle,
                    color: textPrimary
                  }}
                >
                  {exp.highlights.filter(h => h && h.trim()).map((highlight, hIdx) => (
                    <li key={hIdx} className="leading-relaxed">
                      {bulletStyle === 'dash' && <span className="mr-1 text-muted-foreground">–</span>}
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Skills
  const renderSkillsSection = () => {
    if (!skills || skills.length === 0) return null;
    return (
      <div className="space-y-2">
        {renderSectionHeading('Skills & Competencies')}
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, idx) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            return (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 font-medium border"
                style={{
                  borderRadius: `${borderRadiusPx}px`,
                  borderColor,
                  backgroundColor: `${primaryColor}0D`,
                  color: textPrimary,
                }}
              >
                {skillName}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  // Section: Education
  const renderEducationSection = () => {
    if (!education || education.length === 0) return null;
    return (
      <div className="space-y-3">
        {renderSectionHeading('Education')}
        <div className="space-y-2.5">
          {education.map((edu, idx) => (
            <div key={edu.id || idx} className="space-y-0.5">
              <div className="flex justify-between items-baseline flex-wrap">
                <span className="text-xs font-bold" style={{ color: textPrimary }}>
                  {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                </span>
                <span className="text-[11px]" style={{ color: textMuted }}>
                  {edu.startDate} {edu.startDate && edu.endDate ? '–' : ''} {edu.endDate}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-semibold" style={{ color: primaryColor }}>
                  {edu.school || edu.institution}
                </span>
                {edu.location && <span className="text-[11px]" style={{ color: textMuted }}>{edu.location}</span>}
              </div>
              {edu.gpa && (
                <div className="text-[11px]" style={{ color: textMuted }}>
                  GPA: {edu.gpa}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Projects
  const renderProjectsSection = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div className="space-y-3">
        {renderSectionHeading('Key Projects')}
        <div className="space-y-2.5">
          {projects.map((proj, idx) => (
            <div key={proj.id || idx} className="space-y-0.5">
              <div className="flex justify-between items-baseline flex-wrap">
                <span className="text-xs font-bold" style={{ color: textPrimary }}>
                  {proj.name}
                </span>
                {proj.technologies && (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                    {proj.technologies}
                  </span>
                )}
              </div>
              {proj.description && (
                <p className="text-xs leading-relaxed" style={{ color: textPrimary }}>
                  {proj.description}
                </p>
              )}
              {proj.link && (
                <a
                  href={proj.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium underline"
                  style={{ color: primaryColor }}
                >
                  <ExternalLink className="size-2.5" />
                  View Project
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Certifications
  const renderCertificationsSection = () => {
    if (!certifications || certifications.length === 0) return null;
    return (
      <div className="space-y-2">
        {renderSectionHeading('Certifications')}
        <div className="space-y-1.5">
          {certifications.map((cert, idx) => (
            <div key={cert.id || idx} className="flex justify-between items-baseline text-xs">
              <span className="font-semibold" style={{ color: textPrimary }}>
                {cert.name}
              </span>
              <span className="text-[11px]" style={{ color: textMuted }}>
                {cert.issuer} {cert.date ? `(${cert.date})` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Custom Sections
  const renderCustomSection = (sec) => {
    return (
      <div key={sec.id} className="space-y-2">
        {renderSectionHeading(sec.title || 'Custom Section')}
        {Array.isArray(sec.items) && (
          <ul className="space-y-1 text-xs pl-4" style={{ listStyleType: bulletStyle, color: textPrimary }}>
            {sec.items.map((it, iIdx) => (
              <li key={iIdx} className="leading-relaxed">
                {it}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Map section name to component render
  const renderSectionByName = (sectionName) => {
    switch (sectionName) {
      case 'personal':
        return renderPersonalSection();
      case 'summary':
        return renderSummarySection();
      case 'experience':
        return renderExperienceSection();
      case 'skills':
        return renderSkillsSection();
      case 'education':
        return renderEducationSection();
      case 'projects':
        return renderProjectsSection();
      case 'certifications':
        return renderCertificationsSection();
      default: {
        const foundCustom = customSections.find(c => c.id === sectionName);
        if (foundCustom) return renderCustomSection(foundCustom);
        return null;
      }
    }
  };

  // Render Zone Content
  const renderZone = (zone) => {
    if (!zone || !zone.sections) return null;
    return (
      <div
        key={zone.id}
        className="space-y-4"
        style={{
          padding: `${zone.paddingPx || 0}px`,
          backgroundColor: zone.backgroundColor || 'transparent',
          gap: `${sectionGapPx}px`,
        }}
      >
        {zone.sections.map((secName) => (
          <React.Fragment key={secName}>
            {renderSectionByName(secName)}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Multi-column or Single-column Zone Layout
  const headerZone = zones.find(z => z.id === 'header');
  const sidebarZone = zones.find(z => z.id === 'sidebar');
  const mainZone = zones.find(z => z.id === 'main');
  const otherZones = zones.filter(z => !['header', 'sidebar', 'main'].includes(z.id));

  return (
    <div
      className="w-full h-full bg-white text-slate-900 transition-colors"
      style={{
        fontFamily,
        fontSize: `${baseSizePt}pt`,
        lineHeight: lineHeightVal,
        padding: `${pageMarginPx}px`,
      }}
    >
      {/* 1. Top Header Zone if present */}
      {headerZone && (
        <div className="mb-4">
          {renderZone(headerZone)}
        </div>
      )}

      {/* 2. Body Zones */}
      {layoutType === 'two_column_left_sidebar' && sidebarZone && mainZone ? (
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-4 border-r pr-4" style={{ borderColor }}>
            {renderZone(sidebarZone)}
          </div>
          <div className="col-span-8">
            {renderZone(mainZone)}
          </div>
        </div>
      ) : layoutType === 'two_column_right_sidebar' && sidebarZone && mainZone ? (
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-8 border-r pr-4" style={{ borderColor }}>
            {renderZone(mainZone)}
          </div>
          <div className="col-span-4 pl-2">
            {renderZone(sidebarZone)}
          </div>
        </div>
      ) : (
        /* Single column or stacked fallback */
        <div className="space-y-4" style={{ gap: `${sectionGapPx}px` }}>
          {mainZone && renderZone(mainZone)}
          {sidebarZone && renderZone(sidebarZone)}
        </div>
      )}

      {/* 3. Additional Custom Zones */}
      {otherZones.map(z => renderZone(z))}
    </div>
  );
}
