import { AccessToken } from './lib/access-token'

(async () => {
  const maxTrials = 10,
    interval = 5000,
    result = {
      success: 0,
      fail: 0
    }

  await trial(0);

  async function trial(trials) {
    trials++;
    if (trials > maxTrials) {
      console.log('End test')
      console.log(result)
    }
    else {
      console.log(`Trial ${trials}`)

      // const t = new AccessToken({ scope: ['configPlatform context:263683', 'refresh_token'] })
      const t = new AccessToken({ scope: ['WMS_ACQ WMS_VIC'] })

      try {
        const data = await t.create();
        result.success++;
        console.log('success')
        // console.log(data)
      } catch (e) {
        result.fail++;
        console.log('error')
        console.error('data' in e ? e.data : 'errno' in e ? e.errno : e)
      }

      if (trials < maxTrials) {
        setTimeout(() => {
          trial(trials)
        }, interval)
      }
    }
  }
})()