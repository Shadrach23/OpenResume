import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumeFeaturedSkill,
} from "components/Resume/ResumePDF/common";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import type { ResumeSkills } from "lib/redux/types";

export const ResumePDFSkills = ({
  heading,
  skills,
  themeColor,
  showBulletPoints,
  sectionAlign = 'left',
}: {
  heading: string;
  skills: ResumeSkills;
  themeColor: string;
  showBulletPoints: boolean;
  sectionAlign?: 'left' | 'center' | 'right';
}) => {
  const { descriptions, featuredSkills } = skills;
  const featuredSkillsWithText = featuredSkills.filter((item) => item.skill);
  const featuredSkillsPair = [
    [featuredSkillsWithText[0], featuredSkillsWithText[3]],
    [featuredSkillsWithText[1], featuredSkillsWithText[4]],
    [featuredSkillsWithText[2], featuredSkillsWithText[5]],
  ];

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
      {featuredSkillsWithText.length > 0 && (
        <View style={{ ...styles.flexRowBetween, marginTop: spacing["0.5"] }}>
          {featuredSkillsPair.map((pair, idx) => (
            <View
              key={idx}
              style={{
                ...styles.flexCol,
              }}
            >
              {pair.map((featuredSkill, idx) => {
                if (!featuredSkill) return null;
                return (
                  <ResumeFeaturedSkill
                    key={idx}
                    skill={featuredSkill.skill}
                    rating={featuredSkill.rating}
                    themeColor={themeColor}
                    style={{
                      justifyContent:
                        sectionAlign === 'center'
                          ? 'center'
                          : sectionAlign === 'right'
                          ? 'flex-end'
                          : 'flex-start',
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      )}
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
