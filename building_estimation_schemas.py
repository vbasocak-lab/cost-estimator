from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class UnitType(str, Enum):
    SQUARE_FEET = "square_feet"
    LINEAR_FEET = "linear_feet"
    CUBIC_YARDS = "cubic_yards"
    EACH = "each"
    HOURS = "hours"


class MaterialCategory(str, Enum):
    CONCRETE = "concrete"
    LUMBER = "lumber"
    STEEL = "steel"
    ELECTRICAL = "electrical"
    PLUMBING = "plumbing"
    HVAC = "hvac"
    FINISHING = "finishing"
    ROOFING = "roofing"
    INSULATION = "insulation"
    MISCELLANEOUS = "miscellaneous"


class Material(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=1, max_length=255)
    category: MaterialCategory
    unit_type: UnitType
    unit_cost: float = Field(..., gt=0)
    supplier: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None


class LaborCategory(str, Enum):
    GENERAL = "general"
    ELECTRICAL = "electrical"
    PLUMBING = "plumbing"
    HVAC = "hvac"
    CARPENTRY = "carpentry"
    MASONRY = "masonry"
    PAINTING = "painting"
    ROOFING = "roofing"


class Labor(BaseModel):
    id: Optional[int] = None
    category: LaborCategory
    description: str = Field(..., min_length=1, max_length=255)
    hourly_rate: float = Field(..., gt=0)
    estimated_hours: float = Field(..., gt=0)
    crew_size: int = Field(default=1, gt=0)

    @property
    def total_labor_cost(self) -> float:
        return self.hourly_rate * self.estimated_hours * self.crew_size


class LineItem(BaseModel):
    id: Optional[int] = None
    material: Optional[Material] = None
    labor: Optional[Labor] = None
    quantity: float = Field(..., gt=0)
    markup_percentage: float = Field(default=0.0, ge=0)
    notes: Optional[str] = None

    @property
    def material_cost(self) -> float:
        if self.material:
            return self.material.unit_cost * self.quantity
        return 0.0

    @property
    def labor_cost(self) -> float:
        if self.labor:
            return self.labor.total_labor_cost
        return 0.0

    @property
    def subtotal(self) -> float:
        return self.material_cost + self.labor_cost

    @property
    def total_with_markup(self) -> float:
        return self.subtotal * (1 + self.markup_percentage / 100)


class ProjectPhase(str, Enum):
    PLANNING = "planning"
    FOUNDATION = "foundation"
    FRAMING = "framing"
    ROUGH_IN = "rough_in"
    INSULATION = "insulation"
    DRYWALL = "drywall"
    FINISHING = "finishing"
    FINAL_INSPECTION = "final_inspection"


class EstimationSection(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=1, max_length=255)
    phase: ProjectPhase
    line_items: List[LineItem] = []
    contingency_percentage: float = Field(default=10.0, ge=0, le=100)

    @property
    def section_subtotal(self) -> float:
        return sum(item.total_with_markup for item in self.line_items)

    @property
    def contingency_amount(self) -> float:
        return self.section_subtotal * (self.contingency_percentage / 100)

    @property
    def section_total(self) -> float:
        return self.section_subtotal + self.contingency_amount


class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BuildingEstimate(BaseModel):
    id: Optional[int] = None
    project_name: str = Field(..., min_length=1, max_length=255)
    client_name: str = Field(..., min_length=1, max_length=255)
    project_address: str = Field(..., min_length=1, max_length=500)
    project_description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.DRAFT
    sections: List[EstimationSection] = []
    tax_percentage: float = Field(default=0.0, ge=0, le=100)
    created_by: Optional[str] = None
    notes: Optional[str] = None

    @property
    def subtotal(self) -> float:
        return sum(section.section_total for section in self.sections)

    @property
    def tax_amount(self) -> float:
        return self.subtotal * (self.tax_percentage / 100)

    @property
    def grand_total(self) -> float:
        return self.subtotal + self.tax_amount

    def get_cost_summary(self) -> dict:
        return {
            "project_name": self.project_name,
            "subtotal": self.subtotal,
            "tax_amount": self.tax_amount,
            "grand_total": self.grand_total,
            "sections": [
                {
                    "name": section.name,
                    "phase": section.phase,
                    "total": section.section_total,
                }
                for section in self.sections
            ],
        }