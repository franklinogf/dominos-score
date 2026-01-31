import { InputField } from '@/components/input-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { useT } from '@/hooks/use-translation';
import { useGame } from '@/stores/use-game';
import { useScoreModal } from '@/stores/use-score-modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

const createSchema = (t: (key: string, options?: any) => string) => {
  return z.object({
    score: z.coerce
      .number()
      .min(1, t('validation.min', { field: t('game.score'), value: 1 })),
  });
};

export function ScoreModal() {
  const { t } = useT();
  const { isOpen, close, playerId } = useScoreModal();
  const addScoreToPlayer = useGame((state) => state.addScoreToPlayer);
  const schema = createSchema(t);
  const {
    control,
    formState: { errors, isSubmitting },
    reset,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      score: '',
    },
  });

  const { players } = useGame();
  const player = players.find((p) => p.id === playerId);
  if (!player) return null;

  const onSubmit = (data: z.infer<typeof schema>) => {
    addScoreToPlayer(player, data.score);
    close();
    reset({ score: '' });
  };

  const onClose = () => {
    close();
    reset({ score: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-full">
        <DialogHeader>
          <DialogTitle>
            <Text variant="large">{t('game.addScore')}</Text>
          </DialogTitle>
        </DialogHeader>
        <InputField
          autoFocus
          name="score"
          control={control}
          label={t('game.enterScoreFor', { name: player.name })}
          error={errors.score?.message}
          keyboardType="number-pad"
          labelClassName="font-bold text-xl mb-2"
        />
        <View className="mt-4 flex-row justify-end">
          <Button className="mr-2" variant="outline" onPress={onClose}>
            <Text>{t('common.cancel')}</Text>
          </Button>
          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Text>{t('game.add')}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}
