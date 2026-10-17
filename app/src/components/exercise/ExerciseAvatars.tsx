import { Image } from 'expo-image';
import { View } from 'react-native';

import type { ExerciseId } from '@/constants/exercises';
import { useGuideImages } from '@/hooks/useGuide';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

/** Up to five exercise thumbnails as overlapping circles, then "+n" (Today's card, the Coach's workout cards). */
export function ExerciseAvatars({ ids, blurred }: { ids: readonly ExerciseId[]; blurred?: boolean }) {
  const styles = useStyles();
  const images = useGuideImages();
  const shown = ids.slice(0, 5);
  return (
    <View style={styles.row} accessible={false}>
      {shown.map((id, i) => (
        <Image
          key={id}
          source={images.exercises[id].thumb}
          style={[styles.avatar, i > 0 && styles.overlap]}
          contentFit="cover"
          blurRadius={blurred ? 10 : 0}
        />
      ))}
      {ids.length > shown.length ? (
        <View style={[styles.avatar, styles.overlap, styles.more]}>
          <AppText variant="caption" style={styles.moreText}>
            +{ids.length - shown.length}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row' },
  avatar: { width: 42, height: 42, borderRadius: tokens.radius.pill, borderWidth: 2, borderColor: colors.surface, backgroundColor: colors.plate },
  overlap: { marginLeft: -12 },
  more: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  moreText: { fontWeight: tokens.font.weight.bold },
}));
