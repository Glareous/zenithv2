import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicList from '@src/views/UiElements/Ui-ListGroup/BasicList'
import BorderedList from '@src/views/UiElements/Ui-ListGroup/BorderedList'
import BoxedList from '@src/views/UiElements/Ui-ListGroup/BoxedList'
import CheckboxList from '@src/views/UiElements/Ui-ListGroup/CheckboxList'
import CircleList from '@src/views/UiElements/Ui-ListGroup/CircleList'
import ContentList from '@src/views/UiElements/Ui-ListGroup/ContentList'
import DiscColorList from '@src/views/UiElements/Ui-ListGroup/DiscColorList'
import DiscList from '@src/views/UiElements/Ui-ListGroup/DiscList'
import FlushList from '@src/views/UiElements/Ui-ListGroup/FlushList'
import HoveredList from '@src/views/UiElements/Ui-ListGroup/HoveredList'
import ImagesList from '@src/views/UiElements/Ui-ListGroup/ImagesList'
import LinkList from '@src/views/UiElements/Ui-ListGroup/LinkList'
import MarkerColorList from '@src/views/UiElements/Ui-ListGroup/MarkerColorList'
import NumberColorList from '@src/views/UiElements/Ui-ListGroup/NumberColorList'
import NumberList from '@src/views/UiElements/Ui-ListGroup/NumberList'
import RadioList from '@src/views/UiElements/Ui-ListGroup/RadioList'
import RomanUperList from '@src/views/UiElements/Ui-ListGroup/RomanUperList'
import SquareList from '@src/views/UiElements/Ui-ListGroup/SquareList'

const ListGroups: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="List Group" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <BasicList />
        <DiscList />
        <NumberList />
        <SquareList />
        <RomanUperList />
        <CircleList />
        <DiscColorList />
        <MarkerColorList />
        <NumberColorList />
        <ImagesList />
        <FlushList />
        <BorderedList />
        <HoveredList />
        <LinkList />
        <CheckboxList />
        <RadioList />
        <BoxedList />
        <ContentList />
      </div>
    </React.Fragment>
  )
}

export default ListGroups
