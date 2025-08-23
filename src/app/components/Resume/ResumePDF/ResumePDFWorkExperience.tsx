import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeWorkExperience } from "lib/redux/types";

export const ResumePDFWorkExperience = ({
  heading,
  workExperiences,
  themeColor,
  sectionAlign = 'left',
}: {
  heading: string;
  workExperiences: ResumeWorkExperience[];
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
      {workExperiences.map(({ company, jobTitle, date, descriptions }, idx) => {
        // Hide company name if it is the same as the previous company
        const hideCompanyName =
          idx > 0 && company === workExperiences[idx - 1].company;

        return (
          <View key={idx} style={idx !== 0 ? { marginTop: spacing["2"] } : {}}>
            {!hideCompanyName && (
              <ResumePDFText bold={true} style={{ textAlign: sectionAlign as any }}>
                {company}
              </ResumePDFText>
            )}
            <View
              style={{
                ...styles.flexRowBetween,
                marginTop: hideCompanyName
                  ? "-" + spacing["1"]
                  : spacing["1.5"],
              }}
            >
              <ResumePDFText style={{ textAlign: sectionAlign as any }}>
                {jobTitle}
              </ResumePDFText>
              <ResumePDFText style={{ textAlign: sectionAlign as any }}>
                {date}
              </ResumePDFText>
            </View>
            <View style={{ ...styles.flexCol, marginTop: spacing["1.5"] }}>
              <ResumePDFBulletList items={descriptions} textAlign={sectionAlign} />
            </View>
          </View>
        );
      })}
    </ResumePDFSection>
  );
};
