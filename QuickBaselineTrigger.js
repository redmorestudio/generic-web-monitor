/**
 * Quick Baseline Trigger Setup
 * This creates a one-time trigger to run baseline generation with full permissions
 */

function setupOneTimeBaselineTrigger() {
  console.log('=== SETTING UP ONE-TIME BASELINE TRIGGER ===');
  
  try {
    // Delete any existing baseline triggers to prevent duplicates
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;
    
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'forceProcessAllUrls' || 
          trigger.getHandlerFunction() === 'runTriggeredBaseline') {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} existing baseline triggers`);
    }
    
    // Create a new trigger to run in 2 minutes
    const trigger = ScriptApp.newTrigger('runTriggeredBaseline')
      .timeBased()
      .after(2 * 60 * 1000) // 2 minutes from now
      .create();
      
    const runTime = new Date(new Date().getTime() + 2 * 60 * 1000);
    
    console.log('✅ Baseline trigger created!');
    console.log(`Will run at: ${runTime.toLocaleString()}`);
    console.log('Trigger ID:', trigger.getUniqueId());
    
    return {
      success: true,
      message: 'Baseline generation will start in 2 minutes',
      runTime: runTime.toISOString(),
      triggerId: trigger.getUniqueId()
    };
    
  } catch (error) {
    console.error('Failed to create trigger:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * This function will be called by the trigger with full permissions
 */
function runTriggeredBaseline() {
  console.log('=== TRIGGERED BASELINE GENERATION STARTING ===');
  console.log('Running with trigger permissions - this should work!');
  console.log('Time:', new Date().toISOString());
  
  try {
    // First test if we have permission
    const testResult = checkSimpleAuthorization();
    console.log('Authorization test:', testResult ? 'PASSED' : 'FAILED');
    
    if (!testResult) {
      console.error('Still no authorization in triggered context!');
      return {
        success: false,
        error: 'No authorization even in trigger context'
      };
    }
    
    // Run the force process function
    console.log('Starting baseline processing...');
    const result = forceProcessAllUrls();
    
    console.log('Baseline processing complete!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Send email notification if successful
    if (result.success && result.successful > 0) {
      try {
        const emailBody = `
AI Monitor Baseline Generation Complete!

Total URLs: ${result.totalUrls}
Successfully processed: ${result.successful}
Failed: ${result.failed}

The baseline generation was triggered at ${new Date().toISOString()} and completed successfully.

View your dashboard at: https://redmorestudio.github.io/ai-competitive-monitor/
        `;
        
        MailApp.sendEmail({
          to: Session.getEffectiveUser().getEmail(),
          subject: 'AI Monitor - Baseline Generation Complete',
          body: emailBody
        });
        
        console.log('Email notification sent');
      } catch (emailError) {
        console.log('Could not send email:', emailError);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Triggered baseline failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Check trigger status
 */
function checkBaselineTriggerStatus() {
  const triggers = ScriptApp.getProjectTriggers();
  const baselineTriggers = triggers.filter(t => 
    t.getHandlerFunction() === 'runTriggeredBaseline' ||
    t.getHandlerFunction() === 'forceProcessAllUrls'
  );
  
  if (baselineTriggers.length === 0) {
    return {
      success: true,
      hasTrigger: false,
      message: 'No baseline triggers found'
    };
  }
  
  const triggerInfo = baselineTriggers.map(t => ({
    id: t.getUniqueId(),
    function: t.getHandlerFunction(),
    type: t.getEventType()
  }));
  
  return {
    success: true,
    hasTrigger: true,
    triggers: triggerInfo,
    count: baselineTriggers.length,
    message: `Found ${baselineTriggers.length} baseline trigger(s)`
  };
}
