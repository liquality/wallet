export const getChangelog = async ({ dispatch, commit }) => {
  return new Promise(resolve => {
    const result = {
      version: '1.0.1',
      changeLog: `
      <div class="item-content">
            <pre>Ability to export private keys</pre>
            <pre>Terra integration</pre>
            <pre>Bug fixes and improvements</pre>
          </div>
    `,
      extra: {
        '0x995b9513946da8761351ddd0ec3ccde2dd6da111':
          'https://liquality.io/recovery.html'
      }
    }

    setTimeout(() => {
      resolve(result)
    }, 4000)
  })
}
