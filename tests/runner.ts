import { executeAllTests } from '../server/routes/tests';

async function main() {
  console.log('\n======================================================');
  console.log('🧪 StudyForge Test Suite — Tech Zephyr 4.0 Rubric Check');
  console.log('======================================================\n');

  try {
    const { passedCount, totalCount, results } = await executeAllTests();

    results.forEach(test => {
      const mark = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${mark} [${test.id.toString().padStart(2, '0')}] ${test.name} (${test.durationMs}ms)`);
      console.log(`   └─ Category: ${test.category} | ${test.details}`);
      if (!test.passed && test.diagnostic) {
        console.log(`   └─ Diagnostic:`, test.diagnostic);
      }
    });

    console.log('\n------------------------------------------------------');
    console.log(`Final Summary: ${passedCount}/${totalCount} tests passed (${Math.round((passedCount / totalCount) * 100)}%)`);
    console.log('------------------------------------------------------\n');

    if (passedCount === totalCount) {
      console.log('🎉 ALL TESTS PASSED! Backend logic and autonomous engine fully verified.\n');
      process.exit(0);
    } else {
      console.error('⚠️ Some tests failed. Please inspect diagnostics above.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error running tests:', err);
    process.exit(1);
  }
}

main();
