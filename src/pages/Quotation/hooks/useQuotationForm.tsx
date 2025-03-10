import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, Form } from "antd";
import moment from "moment";
import {
  Quotation,
  QuotationService,
  QuotationStatus,
  QuotationItem,
  QuotationSection,
  QuotationItemGroup,
  ItemType,
} from "../../../services/QuotationService";
import {
  EquipmentService,
  Equipment,
} from "../../../services/EquipmentService";

interface UseQuotationFormProps {
  mode: "create" | "edit";
}

const useQuotationForm = ({ mode }: UseQuotationFormProps) => {
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [sectionForm] = Form.useForm();
  const [groupForm] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [sections, setSections] = useState<QuotationSection[]>([]);
  const [groups, setGroups] = useState<QuotationItemGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // Selected entity IDs for adding items within the hierarchy
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const quotationService = new QuotationService();
  const equipmentService = new EquipmentService();

  // Load data on component mount
  useEffect(() => {
    fetchEquipment();

    if (mode === "edit" && id) {
      fetchQuotation(parseInt(id));
    } else {
      generateQuotationNumber();
    }
  }, [mode, id]);

  // Calculate totals whenever items, tax, or discount changes
  useEffect(() => {
    calculateTotals();
  }, [items, tax, discount]);

  // Fetch equipment for dropdown selection
  const fetchEquipment = async () => {
    try {
      const response = await equipmentService.getAllEquipment({ limit: 100 });
      setEquipment(response.data);
    } catch (error) {
      message.error("Failed to fetch equipment");
      console.error(error);
    }
  };

  // Fetch quotation for edit mode
  const fetchQuotation = async (quotationId: number) => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotationById(quotationId);
      const quotationData = response.data;
      setQuotation(quotationData);

      // Set items and sections
      if (quotationData.items) {
        setItems(quotationData.items);
      }

      if (quotationData.sections) {
        setSections(quotationData.sections);

        // Extract groups from sections
        const allGroups: QuotationItemGroup[] = [];
        quotationData.sections.forEach((section) => {
          if (section.groups) {
            allGroups.push(...section.groups);
          }
        });
        setGroups(allGroups);
      }

      // Set tax and discount for calculations
      setTax(quotationData.tax || 0);
      setDiscount(quotationData.discount || 0);

      // Set form values
      form.setFieldsValue({
        quotationNumber: quotationData.quotationNumber,
        clientName: quotationData.clientName,
        clientEmail: quotationData.clientEmail,
        clientPhone: quotationData.clientPhone,
        clientAddress: quotationData.clientAddress,
        projectName: quotationData.projectName,
        projectDescription: quotationData.projectDescription,
        issueDate: quotationData.issueDate
          ? moment(quotationData.issueDate)
          : moment(),
        validUntil: quotationData.validUntil
          ? moment(quotationData.validUntil)
          : undefined,
        tax: quotationData.tax,
        discount: quotationData.discount,
        notes: quotationData.notes,
        terms: quotationData.terms,
        status: quotationData.status,
      });
    } catch (error) {
      message.error("Failed to fetch quotation details");
      console.error(error);
      navigate("/quotations");
    } finally {
      setLoading(false);
    }
  };

  // Generate a new quotation number for create mode
  const generateQuotationNumber = () => {
    const today = moment();
    const prefix = "Q";
    const dateString = today.format("YYYYMMDD");
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const quotationNumber = `${prefix}-${dateString}-${randomNum}`;

    form.setFieldsValue({
      quotationNumber,
      issueDate: today,
      validUntil: today.clone().add(30, "days"),
      tax: 11, // Default tax rate 11% (Indonesia)
      discount: 0,
      status: QuotationStatus.DRAFT,
    });
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      if (items.length === 0 && sections.length === 0) {
        message.error("Quotation must have at least one item or section");
        return;
      }

      setSubmitting(true);

      // Prepare quotation data with hierarchy
      const sectionsData = sections.map((section) => ({
        id: section.id,
        name: section.name,
        date: section.date,
        description: section.description,
        groups: groups
          .filter((group) => group.sectionId === section.id)
          .map((group) => ({
            id: group.id,
            name: group.name,
            items: items
              .filter((item) => item.groupId === group.id)
              .map((item) => ({
                id: item.id,
                itemName: item.itemName,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                pricePerDay: item.pricePerDay,
                days: item.days,
                total: item.total,
                type: item.type,
                remarks: item.remarks,
                equipmentId: item.equipmentId,
              })),
          })),
      }));

      // Include any items not assigned to groups
      const standaloneItems = items
        .filter((item) => !item.groupId)
        .map((item) => ({
          id: item.id,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          pricePerDay: item.pricePerDay,
          days: item.days,
          total: item.total,
          type: item.type,
          remarks: item.remarks,
          equipmentId: item.equipmentId,
        }));

      const quotationData = {
        ...values,
        issueDate: values.issueDate.format("YYYY-MM-DD"),
        validUntil: values.validUntil
          ? values.validUntil.format("YYYY-MM-DD")
          : undefined,
        sections: sectionsData,
        items: standaloneItems,
        subtotal,
        tax: values.tax,
        discount: values.discount,
        total,
      };

      if (mode === "create") {
        await quotationService.createQuotation(quotationData);
        message.success("Quotation created successfully");
      } else if (mode === "edit" && id) {
        await quotationService.updateQuotation(parseInt(id), quotationData);
        message.success("Quotation updated successfully");
      }

      navigate("/quotations");
    } catch (error) {
      message.error(
        mode === "create"
          ? "Failed to create quotation"
          : "Failed to update quotation"
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Add a new section to the quotation
  const handleAddSection = (values: any) => {
    const newSection: QuotationSection = {
      id: Date.now(), // Temporary ID for UI
      quotationId: quotation?.id || 0,
      name: values.name,
      date: values.date.format("YYYY-MM-DD"),
      description: values.description,
      subtotal: 0,
      groups: [],
    };

    setSections([...sections, newSection]);
    sectionForm.resetFields();
    setSelectedSectionId(newSection.id);
    message.success(`Section "${values.name}" added`);
  };

  // Remove a section from the quotation
  const handleRemoveSection = (sectionId: number) => {
    // Remove all groups belonging to this section
    const groupsToRemove = groups.filter(
      (group) => group.sectionId === sectionId
    );
    const groupIdsToRemove = groupsToRemove.map((group) => group.id);

    // Remove all items belonging to these groups
    const remainingItems = items.filter(
      (item) =>
        !item.groupId || !groupIdsToRemove.includes(item.groupId as number)
    );

    // Remove the groups
    const remainingGroups = groups.filter(
      (group) => group.sectionId !== sectionId
    );

    // Remove the section
    const remainingSections = sections.filter(
      (section) => section.id !== sectionId
    );

    setItems(remainingItems);
    setGroups(remainingGroups);
    setSections(remainingSections);

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
      setSelectedGroupId(null);
    }

    message.success("Section removed");
  };

  // Add a new group to the selected section
  const handleAddGroup = (values: any) => {
    if (!selectedSectionId) {
      message.error("Please select a section first");
      return;
    }

    const newGroup: QuotationItemGroup = {
      id: Date.now(), // Temporary ID for UI
      name: values.name,
      sectionId: selectedSectionId,
      description: values.description,
      total: 0,
      items: [],
    };

    setGroups([...groups, newGroup]);
    groupForm.resetFields();
    setSelectedGroupId(newGroup.id);
    message.success(`Group "${values.name}" added`);
  };

  // Remove a group from a section
  const handleRemoveGroup = (groupId: number) => {
    // Remove all items belonging to this group
    const remainingItems = items.filter((item) => item.groupId !== groupId);

    // Remove the group
    const remainingGroups = groups.filter((group) => group.id !== groupId);

    setItems(remainingItems);
    setGroups(remainingGroups);

    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }

    message.success("Group removed");
  };

  // Add a new item to a group or quotation
  const handleAddItem = (values: any) => {
    const selectedEquipment = values.equipmentId
      ? equipment.find((e) => e.id === values.equipmentId)
      : undefined;

    const pricePerDay =
      values.pricePerDay ||
      (selectedEquipment ? selectedEquipment.dailyRentalPrice : 0);
    const quantity = values.quantity || 1;
    const days = values.days || 1;
    const totalPrice = pricePerDay * quantity * days;

    const newItem: QuotationItem = {
      id: Date.now(), // Temporary ID for UI
      quotationId: quotation?.id || 0,
      groupId: selectedGroupId,
      equipmentId: values.equipmentId,
      equipment: selectedEquipment
        ? {
            id: selectedEquipment.id,
            name: selectedEquipment.name,
            dailyRentalPrice: selectedEquipment.dailyRentalPrice,
          }
        : undefined,
      itemName:
        values.itemName || (selectedEquipment ? selectedEquipment.name : ""),
      description: values.description,
      quantity: quantity,
      unit: values.unit || "Set",
      pricePerDay: pricePerDay,
      days: days,
      total: totalPrice,
      type: values.type || ItemType.RENTAL,
      remarks: values.remarks,
    };

    setItems([...items, newItem]);
    itemForm.resetFields();
    message.success(`Item "${newItem.itemName}" added`);
  };

  // Remove an item
  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId));
    message.success("Item removed");
  };

  // Calculate the total quotation amount
  const calculateTotals = () => {
    // Calculate subtotal from all items
    const calculatedSubtotal = items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    setSubtotal(calculatedSubtotal);

    // Get current tax and discount values from form
    const currentTax = form.getFieldValue("tax") || 0;
    const currentDiscount = form.getFieldValue("discount") || 0;

    // Update state
    setTax(currentTax);
    setDiscount(currentDiscount);

    // Calculate tax and discount amounts
    const taxAmount = calculatedSubtotal * (currentTax / 100);
    const discountAmount = calculatedSubtotal * (currentDiscount / 100);

    // Calculate total
    const calculatedTotal = calculatedSubtotal + taxAmount - discountAmount;
    setTotal(calculatedTotal);

    // Update group totals
    const updatedGroups = groups.map((group) => {
      const groupItems = items.filter((item) => item.groupId === group.id);
      const groupTotal = groupItems.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );
      return { ...group, total: groupTotal };
    });
    setGroups(updatedGroups);

    // Update section subtotals
    const updatedSections = sections.map((section) => {
      const sectionGroups = updatedGroups.filter(
        (group) => group.sectionId === section.id
      );
      const sectionSubtotal = sectionGroups.reduce(
        (sum, group) => sum + (group.total || 0),
        0
      );
      return { ...section, subtotal: sectionSubtotal };
    });
    setSections(updatedSections);
  };

  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "";
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  // Parse currency strings to numbers
  const parseCurrency = (value: string | undefined) => {
    if (!value || value === "Rp ") return 0;
    return Number(value.replace(/[^\d]/g, ""));
  };

  return {
    form,
    itemForm,
    sectionForm,
    groupForm,
    loading,
    submitting,
    quotation,
    items,
    sections,
    groups,
    equipment,
    subtotal,
    tax,
    discount,
    total,
    selectedSectionId,
    selectedGroupId,
    setSelectedSectionId,
    setSelectedGroupId,
    handleSubmit,
    handleAddItem,
    handleRemoveItem,
    handleAddSection,
    handleRemoveSection,
    handleAddGroup,
    handleRemoveGroup,
    formatCurrency,
    parseCurrency,
  };
};

export default useQuotationForm;
