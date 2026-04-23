import { createContext, useContext } from 'react'

const TabContext = createContext(false)

export const TabProvider = TabContext.Provider
export const useInTab = () => useContext(TabContext)
