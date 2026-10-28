import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { FONTS } from '../theme/types';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** Optional icon button rendered on the right (e.g. menu "⋮" or add "+"). */
  rightIcon?: string;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  /** Fill the right icon button with the accent color instead of surface (e.g. "add player"). */
  rightFilled?: boolean;
}

/**
 * Shared in-content header used by every screen except Home (which has its
 * own bespoke layout) and the AddUser/EditUser bottom sheet (which has no
 * header at all). Matches the reference design: a square rounded-10 back
 * button, a Sora title (with optional small caps subtitle), and an optional
 * matching icon button on the right.
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel,
  rightFilled = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.borderLight }]}>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
        onPress={onBack}
        accessibilityLabel="Retour"
      >
        <Text style={[styles.backGlyph, { color: theme.colors.text }]}>‹</Text>
      </TouchableOpacity>

      <View style={styles.titleBlock}>
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightIcon ? (
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: rightFilled ? theme.colors.primary : theme.colors.surface,
            },
          ]}
          onPress={onRightPress}
          accessibilityLabel={rightAccessibilityLabel}
        >
          <Text
            style={[
              styles.rightGlyph,
              { color: rightFilled ? theme.colors.onPrimary : theme.colors.text },
            ]}
          >
            {rightIcon}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButtonSpacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonSpacer: {
    width: 36,
    height: 36,
  },
  backGlyph: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
  },
  rightGlyph: {
    fontSize: 18,
    fontFamily: FONTS.bodyBold,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontFamily: FONTS.titleExtraBold,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: FONTS.bodySemiBold,
    marginTop: 2,
  },
});

export default ScreenHeader;
