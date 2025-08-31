import React, { Fragment } from 'react';
import Board from '@asseinfo/react-kanban';
import { Card, CardHeader, CardBody, Media } from 'reactstrap';
import { H5, H6, LI, P, UL, Image } from '../../../AbstractElements';
import { customDefaultData } from '../../../Data/MockTable/Apiboard';

const CustomeBoard = () => {
  const customboard = customDefaultData;

  var images = require.context('../../../assets/images', true);
  const dynamicImage = (image) => {
    return images(`./${image}`);
  };

  return (
    <Fragment>
      {customboard &&
        <Card>
          <CardHeader>
            <H5>Custom Demo</H5>
          </CardHeader>
          <CardBody className="kanban-block">
            <div className="kanban-container custom-board">
              <main className="kanban-drag">
                <Board
                  allowAddCard={{ on: 'top' }}
                  initialBoard={customboard}
                  renderCard={({ title, date, priority, img, company, rate, customer_img1, customer_img2, customer_img3, bg_color, id }) => (
                    <div className="kanban-item" key={id}>
                      <a className={`kanban-box ${bg_color}`} href="#javascript">
                        <span className="date">{date}</span>
                        <span className={`badge ${priority === 'Low' ? 'badge-success' : 'badge-primary'} f-right`}>{priority}</span>
                        <H6>{title}</H6>
                        <Media><Image attrImage={{
                          className: 'img-20 me-1 rounded-circle', src:
                            `${dynamicImage(img)}`, alt: ''
                        }} />
                          <Media body><P>{company}</P></Media>
                        </Media>
                        <div className="d-flex mt-3">
                          <UL attrUL={{ className: 'simple-list list flex-row ' }}>
                            <LI attrLI={{ className: ' border-0' }}><i className="fa fa-comments-o"></i>{'2'}</LI>
                            <LI attrLI={{ className: ' border-0' }}><i className="fa fa-paperclip"></i>{'2'}</LI>
                            <LI attrLI={{ className: ' border-0' }}><i className="fa fa-eye"></i></LI>
                          </UL>
                          <div className="customers">
                            <UL attrUL={{ className: 'simple-list d-flex flex-row' }}>
                              <LI attrLI={{ className: 'd-inline-block me-3  border-0' }}>
                                <P attrPara={{ className: 'f-12' }}>{rate}</P>
                              </LI>
                              <LI attrLI={{ className: 'd-inline-block  border-0' }}><Image attrImage={{ className: 'img-20 rounded-circle', src: ` ${dynamicImage(customer_img1)}`, alt: '' }} /></LI>
                              <LI attrLI={{ className: 'd-inline-block  border-0' }}><Image attrImage={{ className: 'img-20 rounded-circle', src: ` ${dynamicImage(customer_img2)}`, alt: '' }} /></LI>
                              <LI attrLI={{ className: 'd-inline-block  border-0' }}><Image attrImage={{ className: 'img-20 rounded-circle', src: ` ${dynamicImage(customer_img3)}`, alt: '' }} /></LI>
                            </UL>
                          </div>
                        </div>
                      </a>
                    </div>
                  )}
                >
                  {customboard}
                </Board>
              </main>
            </div>
          </CardBody>
        </Card>
      }
    </Fragment>
  );
};
export default CustomeBoard;