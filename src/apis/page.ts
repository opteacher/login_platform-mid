import { reqGet } from '@lib/utils'

export default {
  colcElements: (url: string) =>
    reqGet('page', 'element/s', {
      type: 'api',
      action: 'collect',
      axiosConfig: { params: { url } }
    })
}
