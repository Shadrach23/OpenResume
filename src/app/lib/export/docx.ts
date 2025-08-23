import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { Resume } from "lib/redux/types";
import type { Settings, ShowForm } from "lib/redux/settingsSlice";

const alignMap = (align: 'left' | 'center' | 'right' | undefined) => {
  switch (align) {
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    default:
      return AlignmentType.LEFT;
  }
};

export async function buildDocx(resume: Resume, settings: Settings): Promise<Blob> {
  const { profile, workExperiences, educations, projects, skills, custom } = resume;
  const { formToHeading, formToShow, formsOrder, fontFamily, fontSize } = settings;

  const paragraphs: Paragraph[] = [];

  // Header (Name)
  paragraphs.push(
    new Paragraph({
      text: profile.name || "",
      heading: HeadingLevel.HEADING_1,
      alignment: alignMap(settings.headerAlign),
    })
  );

  // Summary
  if (profile.summary) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: profile.summary })],
        alignment: alignMap(settings.headerAlign),
      })
    );
  }

  // Contact line
  const contacts: string[] = [];
  if (profile.email) contacts.push(profile.email);
  if (profile.phone) contacts.push(profile.phone);
  if (profile.url) contacts.push(profile.url);
  if (profile.location) contacts.push(profile.location);
  if (contacts.length) {
    paragraphs.push(
      new Paragraph({ text: contacts.join("  •  "), alignment: alignMap(settings.headerAlign) })
    );
  }

  const showFormsOrder = formsOrder.filter((f) => formToShow[f]);

  const addHeading = (text: string) => {
    if (!text) return;
    paragraphs.push(
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        alignment: alignMap(settings.sectionAlign),
      })
    );
  };

  // Sections
  const addWork = () => {
    addHeading(formToHeading["workExperiences"]);
    workExperiences.forEach((we) => {
      if (we.company) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: we.company, bold: true })],
            alignment: alignMap(settings.sectionAlign),
          })
        );
      }
      const line = [we.jobTitle, we.date].filter(Boolean).join("    ");
      if (line) {
        paragraphs.push(
          new Paragraph({ text: line, alignment: alignMap(settings.sectionAlign) })
        );
      }
      (we.descriptions || []).forEach((d) => {
        if (!d) return;
        paragraphs.push(
          new Paragraph({
            text: d,
            bullet: { level: 0 },
            alignment: alignMap(settings.sectionAlign),
          })
        );
      });
    });
  };

  const addEdu = () => {
    addHeading(formToHeading["educations"]);
    educations.forEach((ed) => {
      if (ed.school) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: ed.school, bold: true })],
            alignment: alignMap(settings.sectionAlign),
          })
        );
      }
      const degreeGpa = ed.gpa ? `${ed.degree} - ${ed.gpa}` : ed.degree;
      const line = [degreeGpa, ed.date].filter(Boolean).join("    ");
      if (line) {
        paragraphs.push(
          new Paragraph({ text: line, alignment: alignMap(settings.sectionAlign) })
        );
      }
      (ed.descriptions || []).forEach((d) => {
        if (!d) return;
        paragraphs.push(
          new Paragraph({ text: d, bullet: { level: 0 }, alignment: alignMap(settings.sectionAlign) })
        );
      });
    });
  };

  const addProjects = () => {
    addHeading(formToHeading["projects"]);
    projects.forEach((p) => {
      const line = [p.project, p.date].filter(Boolean).join("    ");
      if (line) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: p.project || "", bold: true }),
              new TextRun({ text: p.date ? `    ${p.date}` : "" }),
            ],
            alignment: alignMap(settings.sectionAlign),
          })
        );
      }
      (p.descriptions || []).forEach((d) => {
        if (!d) return;
        paragraphs.push(
          new Paragraph({ text: d, bullet: { level: 0 }, alignment: alignMap(settings.sectionAlign) })
        );
      });
    });
  };

  const addSkills = () => {
    addHeading(formToHeading["skills"]);
    // featured skills as a simple line
    const featured = (skills.featuredSkills || [])
      .map((fs) => fs?.skill)
      .filter(Boolean) as string[];
    if (featured.length) {
      paragraphs.push(
        new Paragraph({
          text: featured.join("  •  "),
          alignment: alignMap(settings.sectionAlign),
        })
      );
    }
    (skills.descriptions || []).forEach((d) => {
      if (!d) return;
      paragraphs.push(
        new Paragraph({ text: d, bullet: { level: 0 }, alignment: alignMap(settings.sectionAlign) })
      );
    });
  };

  const addCustom = () => {
    addHeading(formToHeading["custom"]);
    (custom.descriptions || []).forEach((d) => {
      if (!d) return;
      paragraphs.push(
        new Paragraph({ text: d, bullet: { level: 0 }, alignment: alignMap(settings.sectionAlign) })
      );
    });
  };

  const adders: Record<ShowForm, () => void> = {
    workExperiences: addWork,
    educations: addEdu,
    projects: addProjects,
    skills: addSkills,
    custom: addCustom,
  };

  showFormsOrder.forEach((form) => adders[form]());

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  // Set base font
  (doc.Styles as any).default = {
    document: {
      run: {
        font: fontFamily,
        size: Number(fontSize) * 2, // docx uses half-points
      },
    },
  };

  const blob = await Packer.toBlob(doc);
  return blob;
}

export async function downloadDocx(resume: Resume, settings: Settings, fileName: string) {
  const blob = await buildDocx(resume, settings);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
