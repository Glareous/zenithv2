'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import useChartColors from '@src/hooks/useChartColors'
import ApexTree from 'apextree'

import user4 from '../../../assets/images/avatar/user-4.png'
import user11 from '../../../assets/images/avatar/user-11.png'
import user13 from '../../../assets/images/avatar/user-13.png'
import user14 from '../../../assets/images/avatar/user-14.png'
import user15 from '../../../assets/images/avatar/user-15.png'
import user16 from '../../../assets/images/avatar/user-16.png'
import user17 from '../../../assets/images/avatar/user-17.png'
import { TreeData, TreeOptions } from '../../../dtos/pages/apextree'

interface BarChartsProps {
  chartColors: string
  chartDarkColors: string
}

const TopBottomChart = ({ chartColors, chartDarkColors }: BarChartsProps) => {
  const apexTreeContainerRef = useRef<HTMLDivElement | null>(null)
  const [treeData, setTreeData] = useState<TreeData | null>(null)
  const colors = useChartColors({ chartColors, chartDarkColors })

  const initializeTreeData = useCallback(() => {
    const data: TreeData = {
      id: 'ms',
      data: {
        imageURL: user4.src,
        name: 'Jordan Davis',
      },
      options: {
        nodeBGColor: colors[2],
        nodeBGColorHover: colors[2],
      },
      children: [
        {
          id: 'mh',
          data: {
            imageURL: user11.src,
            name: 'Chris Wilson',
          },
          options: {
            nodeBGColor: colors[3],
            nodeBGColorHover: colors[3],
          },
          children: [
            {
              id: 'kb',
              data: {
                imageURL: user13.src,
                name: 'Alex Lee',
              },
              options: {
                nodeBGColor: colors[4],
                nodeBGColorHover: colors[4],
              },
            },
            {
              id: 'cr',
              data: {
                imageURL: user14.src,
                name: 'Taylor Wilson',
              },
              options: {
                nodeBGColor: colors[5],
                nodeBGColorHover: colors[5],
              },
            },
          ],
        },
        {
          id: 'cs',
          data: {
            imageURL: user15.src,
            name: 'Jane Brown',
          },
          options: {
            nodeBGColor: colors[6],
            nodeBGColorHover: colors[6],
          },
          children: [
            {
              id: 'Noah_Chandler',
              data: {
                imageURL: user16.src,
                name: 'John Garcia',
              },
              options: {
                nodeBGColor: colors[7],
                nodeBGColorHover: colors[7],
              },
            },
            {
              id: 'Felix_Wagner',
              data: {
                imageURL: user17.src,
                name: 'Cameron Wilson',
              },
              options: {
                nodeBGColor: colors[8],
                nodeBGColorHover: colors[8],
              },
            },
          ],
        },
      ],
    }
    setTreeData(data)
  }, [colors])

  const renderTree = useCallback(() => {
    if (apexTreeContainerRef.current && treeData) {
      const options: TreeOptions = {
        contentKey: 'data',
        width: '100%',
        height: 600,
        nodeWidth: 150,
        nodeHeight: 120,
        fontColor: colors[1],
        borderColor: colors[0],
        edgeColor: colors[0],
        edgeColorHover: colors[2],
        tooltipBorderColor: colors[0],
        childrenSpacing: 50,
        siblingSpacing: 20,
        direction: 'top',
        nodeTemplate: (content) => `
                    <div class="flex gap-5 justify-center flex-col items-center p-3">
                        <img class="size-12 rounded-full" src='${content.imageURL}' alt='img' />
                        <h6>${content.name}</h6>
                    </div>`,
        enableToolbar: true,
      }

      apexTreeContainerRef.current.innerHTML = '' // Clear the container
      const newApexTree = new ApexTree(apexTreeContainerRef.current, options)
      newApexTree.render(treeData)
    }
  }, [colors, treeData])

  useEffect(() => {
    if (colors.length > 0) {
      initializeTreeData() // Initialize tree data when colors are ready
    }
  }, [colors, initializeTreeData])

  useEffect(() => {
    renderTree() // Render the tree whenever treeData changes

    const reloadTree = () => {
      renderTree() // Re-render tree on resize
    }

    window.addEventListener('resize', reloadTree)
    return () => {
      window.removeEventListener('resize', reloadTree)
    }
  }, [treeData, renderTree]) // Depend on treeData

  return (
    <div
      ref={apexTreeContainerRef}
      className="border border-gray-200 rounded-md dark:border-dark-800"></div>
  )
}

export default TopBottomChart
