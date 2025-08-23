import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeProject } from "lib/redux/types";

export const ResumePDFProject = ({
  heading,
  projects,
  themeColor,
  sectionAlign = 'left',
}: {
  heading: string;
  projects: ResumeProject[];
  themeColor: string;
  sectionAlign?: 'left' | 'center' | 'right';
}) => {
  return (
    <ResumePDFSection
      themeColor={themeColor}
      heading={heading}
      style={{
        alignItems:
          sectionAlign === 'center'
            ? 'center'
            : sectionAlign === 'right'
            ? 'flex-end'
            : 'flex-start',
      }}
    >
      {projects.map(({ project, date, descriptions }, idx) => (
        <View key={idx}>
          <View
            style={{
              ...styles.flexRowBetween,
              marginTop: spacing["0.5"],
            }}
          >
            <ResumePDFText bold={true} style={{ textAlign: sectionAlign as any }}>
              {project}
            </ResumePDFText>
            <ResumePDFText style={{ textAlign: sectionAlign as any }}>{date}</ResumePDFText>
          </View>
          <View style={{ ...styles.flexCol, marginTop: spacing["0.5"] }}>
            <ResumePDFBulletList items={descriptions} textAlign={sectionAlign} />
          </View>
        </View>
      ))}
    </ResumePDFSection>
  );
};
