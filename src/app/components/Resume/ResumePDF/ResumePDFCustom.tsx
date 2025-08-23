import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
} from "components/Resume/ResumePDF/common";
import { styles } from "components/Resume/ResumePDF/styles";
import type { ResumeCustom } from "lib/redux/types";

export const ResumePDFCustom = ({
  heading,
  custom,
  themeColor,
  showBulletPoints,
  sectionAlign = 'left',
}: {
  heading: string;
  custom: ResumeCustom;
  themeColor: string;
  showBulletPoints: boolean;
  sectionAlign?: 'left' | 'center' | 'right';
}) => {
  const { descriptions } = custom;

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
      <View style={{ ...styles.flexCol }}>
        <ResumePDFBulletList
          items={descriptions}
          showBulletPoints={showBulletPoints}
          textAlign={sectionAlign}
        />
      </View>
    </ResumePDFSection>
  );
};
