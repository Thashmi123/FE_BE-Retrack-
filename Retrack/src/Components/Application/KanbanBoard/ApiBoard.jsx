import React, { Fragment, useState } from 'react';
import Board, { moveCard } from '@asseinfo/react-kanban';
import { apitodoboard, CardData } from '../../../Data/MockTable/Apiboard';
import { Btn } from '../../../AbstractElements';

const ApiBoard = () => {
    const [board, setBoard] = useState(apitodoboard);

    const addDefaultboard = () => {
        board.columns.push({
            id: Date.now(),
            title: 'Done',
            cards: CardData
        });
        setBoard({ ...board });
    };
    const AddElementIntoTodo = () => {
        const index = board.columns.findIndex(x => x.title === 'Todo');
        board.columns.map(elm => {
            if (index === 0 && elm.title === 'Todo') {
                return {
                    ...elm,
                    ...elm.cards.push({
                        id: Date.now(),
                        title: 'Test Sidebar',
                        date: '24/7/22',
                        priority: 'Urgent',
                        img: require('../../../assets/images/user/3.jpg'),
                        company: 'Pixelstrap, New york',
                        rate: '+5',
                        customer_img1: require('../../../assets/images/user/3.jpg'),
                        customer_img2: require('../../../assets/images/user/1.jpg'),
                        customer_img3: require('../../../assets/images/user/5.jpg'),
                    })
                };
            }
            return elm;
        });
        setBoard({ ...board });
    };
    const removeDoneboard = () => {
        const index = board.columns.findIndex(x => x.title === 'Done');
        if (index === 2) {
            board.columns.splice(index, 1);
            setBoard({ ...board });
        }
    };
    function handleCardMove(_card, source, destination) {
        const updatedBoard = moveCard(board, source, destination);
        setBoard(updatedBoard);
    }
    return (
        <Fragment>
            <div className="kanban-container">
                <main className="kanban-drag">
                    <Board onCardDragEnd={handleCardMove}
                        renderCard={({ title, date, priority,  img, company, rate, customer_img1, customer_img2, customer_img3 }) => (
                            <div className="kanban-item" id="todo">
                                <a className="kanban-box" href="#javascript">
                                    <span className="date">{date}</span>
                                    <span className={`badge ${priority === "Urgent" ? "badge-danger" : "badge-primary"} f-right`}>{priority}</span>
                                    <img className="mt-2 img-fluid" src='' alt="" />
                                    <h6>{title}</h6>
                                    <div className="media align-items-center">
                                        <img className="img-20 me-1 rounded-circle" src={img} alt="" />
                                        <div className="media-body">
                                            <p>{company}</p>
                                        </div>
                                    </div>
                                    <div className="d-flex mt-3">
                                        <ul className="list">
                                            <li><i className="fa fa-comments-o"></i>2</li>
                                            <li><i className="fa fa-paperclip"></i>2</li>
                                            <li><i className="fa fa-eye"></i></li>
                                        </ul>
                                        <div className="customers">
                                            <ul>
                                                <li className="d-inline-block me-3">
                                                    <p className="f-12">{rate}</p>
                                                </li>
                                                <li className="d-inline-block"><img className="img-20 rounded-circle" src={customer_img1} alt="" /></li>
                                                <li className="d-inline-block"><img className="img-20 rounded-circle" src={customer_img2} alt="" /></li>
                                                <li className="d-inline-block"><img className="img-20 rounded-circle" src={customer_img3} alt="" /></li>
                                            </ul>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        )}
                        >
                        {board}
                    </Board>
                    <div className="mt-3">
                        <Btn attrBtn={{ color: 'primary', className: 'ms-1', onClick: addDefaultboard }}>Add &quot;Default&quot; {'board'}</Btn>
                        <Btn attrBtn={{ color: 'secondary', className: 'ms-1', onClick: AddElementIntoTodo }}>{'Add element in'} &quot;ToDo&quot; {'Board'}</Btn>
                        <Btn attrBtn={{ color: 'danger', className: 'ms-1', onClick: removeDoneboard }}>{'Remove'} &quot;Done&quot; {'Board'}</Btn>
                    </div>
                </main>
            </div>
        </Fragment>
    );
};
export default ApiBoard;