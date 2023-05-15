import { createRouter, createWebHistory } from 'vue-router'
import AddressView from '../views/Address.vue'
import TransactionView from '../views/Transaction.vue'
import BlockView from '../views/Block.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/address/:id',
      name: 'address',
      component: AddressView
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // },
    {
      path: '/transaction/:id',
      name: 'transaction',
      component: TransactionView
    },
    {
      path: '/block/:id',
      name: 'block',
      component: BlockView
    },
  ]
})

export default router
