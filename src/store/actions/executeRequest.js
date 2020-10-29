export const executeRequest = async ({ getters }, { request }) => {
  const client = getters.client(request.network, request.walletId, request.asset)

  let methodFunc
  if (request.method.includes('.')) {
    const [namespace, fnName] = request.method.split('.')
    methodFunc = client[namespace][fnName].bind(client[namespace])
  } else {
    methodFunc = client.getMethod(request.method).bind(client)
  }

  return methodFunc(...request.args)
}
