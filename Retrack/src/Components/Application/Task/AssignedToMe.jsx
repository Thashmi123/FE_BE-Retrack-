import React, { Fragment, useContext, useEffect } from 'react';
import { Link, MoreHorizontal, Printer, Trash2 } from 'react-feather';
import { Card, CardBody, CardHeader, Table } from 'reactstrap';
import { NoTasksFound, Print } from '../../../Constant';
import SweetAlert from 'sweetalert2';
import { H6, P } from '../../../AbstractElements';
import TaskContext from '../../../_helper/Task';

const AssignedToMeClass = ({ title }) => {
  const { allTask, RemoveTask } = useContext(TaskContext);
  useEffect(() => {}, [allTask]);

  const deleteTask = (taskId) => {
    SweetAlert.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this task!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.value) {
        RemoveTask(taskId);
        SweetAlert.fire('Deleted!', 'Your task has been deleted.', 'success');
      } else {
        SweetAlert.fire('Your task is safe!');
      }
    });
  };

  return (
    <Fragment>
      <Card className='mb-0'>
        <CardHeader className='d-flex'>
          <H6 attrH6={{ className: 'mb-0 f-w-600' }}>{title}</H6>
          <a href='#javascript'>
            <Printer className='me-2' />
            {Print}
          </a>
        </CardHeader>
        <CardBody className='p-0'>
          <div className='taskadd'>
            <div className='table-responsive'>
              <Table>
                <thead></thead>
                <tbody>
                  {allTask && allTask.length ? (
                    allTask.map((taskdata) => {
                      return (
                        <tr key={taskdata.task_id}>
                          <td>
                            <H6 attrH6={{ className: 'task_title_0' }}>{taskdata.title}</H6>
                            <P attrPara={{ className: 'project_name_0' }}>{taskdata.priority}</P>
                            {taskdata.tags && taskdata.tags.length > 0 && (
                              <div className="mt-1">
                                {taskdata.tags.map((tag, index) => (
                                  <span key={index} className="badge badge-light me-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td>
                            <P attrPara={{ className: 'task_desc_0' }}>{taskdata.description}</P>
                          </td>
                          <td>
                            <a className='me-2' href='#javascript'>
                              <Link />
                            </a>
                            <a href='#javascript'>
                              <MoreHorizontal />
                            </a>
                          </td>
                          <td>
                            <a href='#javascript' onClick={() => deleteTask(taskdata.task_id)}>
                              <Trash2 />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td>
                        <div className='no-favourite'>
                          <span>{NoTasksFound}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </CardBody>
      </Card>
    </Fragment>
  );
};
export default AssignedToMeClass;
