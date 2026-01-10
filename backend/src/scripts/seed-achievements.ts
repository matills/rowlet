/**
 * Achievement Seeding Script
 *
 * Seeds the achievements table with predefined achievements
 * from the achievement-definitions.json file.
 */

import { supabaseAdmin } from '../config/supabase';
import achievementDefinitions from '../data/achievement-definitions.json';
import { CreateAchievementDTO } from '../types/achievement.types';

interface SeedResult {
  success: boolean;
  inserted: number;
  updated: number;
  errors: string[];
}

async function seedAchievements(): Promise<SeedResult> {
  const result: SeedResult = {
    success: true,
    inserted: 0,
    updated: 0,
    errors: [],
  };

  console.log('🌱 Starting achievement seeding...');
  console.log(`📊 Found ${achievementDefinitions.length} achievements to seed\n`);

  for (const achievement of achievementDefinitions) {
    try {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('achievements')
        .select('id, key')
        .eq('key', achievement.key)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        const { error: updateError } = await supabaseAdmin
          .from('achievements')
          .update({
            name: achievement.name,
            description: achievement.description,
            rarity: achievement.rarity,
            xp_reward: achievement.xp_reward,
            condition_type: achievement.condition_type,
            condition_data: achievement.condition_data,
            display_order: achievement.display_order,
            is_hidden: achievement.is_hidden,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        console.log(`✏️  Updated: ${achievement.key} - ${achievement.name}`);
        result.updated++;
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('achievements')
          .insert({
            key: achievement.key,
            name: achievement.name,
            description: achievement.description,
            rarity: achievement.rarity,
            xp_reward: achievement.xp_reward,
            condition_type: achievement.condition_type,
            condition_data: achievement.condition_data,
            display_order: achievement.display_order,
            is_hidden: achievement.is_hidden,
            is_active: true,
          });

        if (insertError) throw insertError;

        console.log(`✅ Inserted: ${achievement.key} - ${achievement.name}`);
        result.inserted++;
      }
    } catch (error: any) {
      const errorMsg = `Error seeding achievement '${achievement.key}': ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      result.errors.push(errorMsg);
      result.success = false;
    }
  }

  return result;
}

async function main() {
  try {
    const result = await seedAchievements();

    console.log('\n' + '='.repeat(60));
    console.log('📊 Seeding Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Inserted: ${result.inserted}`);
    console.log(`✏️  Updated: ${result.updated}`);
    console.log(`❌ Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach((error) => console.log(`  - ${error}`));
    }

    console.log('\n' + (result.success ? '✅ Seeding completed successfully!' : '❌ Seeding completed with errors'));

    process.exit(result.success ? 0 : 1);
  } catch (error: any) {
    console.error('\n❌ Fatal error during seeding:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { seedAchievements };
