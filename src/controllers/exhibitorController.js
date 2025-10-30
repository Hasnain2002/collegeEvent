import Exhibitor from '../models/Exhibitor.js';

export const getApprovedExhibitors = async (req, res) => {
  try {
    const exhibitors = await Exhibitor.find({ status: 'approved' });
    res.json({ exhibitors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllExhibitors = async (req, res) => {
  try {
    const exhibitors = await Exhibitor.find();
    res.json({ exhibitors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExhibitorById = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.params.id);
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }
    res.json({ exhibitor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createExhibitor = async (req, res) => {
  try {
    const exhibitor = new Exhibitor(req.body);
    const savedExhibitor = await exhibitor.save();
    res.status(201).json({ exhibitor: savedExhibitor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateExhibitor = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }
    res.json({ exhibitor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteExhibitor = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findByIdAndDelete(req.params.id);
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }
    res.json({ message: 'Exhibitor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// New function to update exhibitor status
export const updateExhibitorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const exhibitor = await Exhibitor.findByIdAndUpdate(
      id,
      { 
        status: status,
        approved: status === 'approved'
      },
      { new: true, runValidators: true }
    );
    
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }
    
    res.json({ 
      message: `Exhibitor ${status} successfully`,
      exhibitor 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};