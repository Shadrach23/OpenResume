import { View } from "@react-pdf/renderer";
import {
  ResumePDFBulletList,
  ResumePDFSection,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeEducation } from "lib/redux/types";

export const ResumePDFEducation = ({
  heading,
  educations,
  themeColor,
  showBulletPoints,
  sectionAlign = 'left',
}: {
  heading: string;
  educations: ResumeEducation[];
  themeColor: string;
  showBulletPoints: boolean;
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
      {educations.map(
        ({ school, degree, date, gpa, descriptions = [] }, idx) => {
          // Hide school name if it is the same as the previous school
          const hideSchoolName =
            idx > 0 && school === educations[idx - 1].school;
          const showDescriptions = descriptions.join() !== "";

          return (
            <View key={idx}>
              {!hideSchoolName && (
                <ResumePDFText bold={true} style={{ textAlign: sectionAlign as any }}>
                  {school}
                </ResumePDFText>
              )}
              <View
                style={{
                  ...styles.flexRowBetween,
                  marginTop: hideSchoolName
                    ? "-" + spacing["1"]
                    : spacing["1.5"],
                }}
              >
                <ResumePDFText style={{ textAlign: sectionAlign as any }}>{`${
                  gpa
                    ? `${degree} - ${Number(gpa) ? gpa + " GPA" : gpa}`
                    : degree
                }`}</ResumePDFText>
                <ResumePDFText style={{ textAlign: sectionAlign as any }}>{date}</ResumePDFText>
              </View>
              {showDescriptions && (
                <View style={{ ...styles.flexCol, marginTop: spacing["1.5"] }}>
                  <ResumePDFBulletList
                    items={descriptions}
                    showBulletPoints={showBulletPoints}
                    textAlign={sectionAlign}
                  />
                </View>
              )}
            </View>
          );
        }
      )}
    </ResumePDFSection>
  );
};
