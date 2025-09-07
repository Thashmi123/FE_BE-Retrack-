import React, { Fragment, useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  AddTask,
  TaskTitle,
  Description,
  Save,
  Cancel,
  NewTask,
  Priority,
  DueDate,
} from "../../../Constant";
import { CheckCircle } from "react-feather";
import { Btn } from "../../../AbstractElements";
import TaskContext from "../../../_helper/Task";

const NewTaskClass = () => {
  const { AddNewTask } = useContext(TaskContext);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [addModal, setaddModal] = useState(false);
  const addToggle = () => setaddModal(!addModal);

  const Addtask = (data) => {
    // Handle tags properly - convert to array if needed
    const taskData = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : []
    };
    
    AddNewTask(taskData);
    reset(); // Optional: reset form after submit
    setaddModal(false);
  };

  return (
    <Fragment>
      <button
        className="badge-light-primary d-block w-100 btn-mail"
        onClick={addToggle}
      >
        <CheckCircle className="me-2" />
        {NewTask}
      </button>

      <Modal
        className="modal-bookmark"
        isOpen={addModal}
        toggle={addToggle}
        size="lg"
      >
        <ModalHeader toggle={addToggle}>{AddTask}</ModalHeader>
        <ModalBody>
          <Form
            className="form-bookmark needs-validation"
            onSubmit={handleSubmit(Addtask)}
          >
            <div className="form-row">
              <FormGroup className="col-md-12">
                <Label>{TaskTitle}</Label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input className="form-control" type="text" {...field} />
                  )}
                />
                {errors.title && (
                  <span style={{ color: "red" }}>Title is required</span>
                )}
              </FormGroup>

              <FormGroup className="col-md-12">
                <Label>{Description}</Label>
                <Controller
                  name="desc"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input
                      type="textarea"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
                {errors.desc && (
                  <span style={{ color: "red" }}>Description is required</span>
                )}
              </FormGroup>

              <FormGroup className="col-md-12">
                <Label>{Priority}</Label>
                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <select className="form-control" {...field}>
                      <option value="">Select Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  )}
                />
                {errors.priority && (
                  <span style={{ color: "red" }}>Priority is required</span>
                )}
              </FormGroup>

              <FormGroup className="col-md-12">
                <Label>{DueDate}</Label>
                <Controller
                  name="due_date"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input type="date" className="form-control" {...field} />
                  )}
                />
                {errors.due_date && (
                  <span style={{ color: "red" }}>Due date is required</span>
                )}
              </FormGroup>

              <FormGroup className="col-md-12">
                <Label>Assigned To Email</Label>
                <Controller
                  name="assigned_to_email"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input type="email" className="form-control" {...field} />
                  )}
                />
                {errors.assigned_to_email && (
                  <span style={{ color: "red" }}>
                    Assigned to email is required
                  </span>
                )}
              </FormGroup>

              <FormGroup className="col-md-12">
                <Label>Assigned To Name</Label>
                <Controller
                  name="assigned_to_name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input type="text" className="form-control" {...field} />
                  )}
                />
                {errors.assigned_to_name && (
                  <span style={{ color: "red" }}>
                    Assigned to name is required
                  </span>
                )}
              </FormGroup>
              
              {/* <FormGroup className="col-md-12">
                <Label>Tags</Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <select multiple className="form-control" {...field}>
                      <option value="Notification">Notification</option>
                      <option value="Newsletter">Newsletter</option>
                      <option value="Business">Business</option>
                      <option value="Holidays">Holidays</option>
                    </select>
                  )}
                />
                <small className="form-text text-muted">Hold Ctrl/Cmd to select multiple tags</small>
              </FormGroup> */}
            </div>

            <Btn
              attrBtn={{
                color: "secondary",
                className: "me-2",
                type: "submit",
              }}
            >
              {Save}
            </Btn>
            <Btn
              attrBtn={{ color: "primary", type: "button", onClick: addToggle }}
            >
              {Cancel}
            </Btn>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default NewTaskClass;
