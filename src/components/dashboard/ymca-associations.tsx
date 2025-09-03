'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Building, 
  Users, 
  DollarSign, 
  Globe, 
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Filter,
  Download
} from 'lucide-react';

interface YMCAOrganization {
  id: string;
  associationNumber: string;
  name: string;
  doingBusinessAs?: string;
  facilityType?: 'Facility' | 'Non-Facility' | 'Resident Camp';
  isAssociation: boolean;
  isChartered: boolean;
  associationBranchCount: number;
  budgetRange?: string;
  crmProvider?: string;
  latitude?: number;
  longitude?: number;
  memberGroup?: string;
  learningRegion?: string;
  yStatus?: 'Open' | 'Closed' | 'Merged';
  yType?: string;
  alliancePartner?: string;
  financeSystem?: string;
  potentialPilotInvite: boolean;
  invited: boolean;
  inviteResponse?: string;
  participatedInPilot1: boolean;
  ceoName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
}

export default function YMCAAssociations() {
  const [organizations, setOrganizations] = useState<YMCAOrganization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<YMCAOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [pilotFilter, setPilotFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchTerm, statusFilter, regionFilter, budgetFilter, pilotFilter]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrganizations = () => {
    let filtered = organizations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.associationNumber?.includes(searchTerm) ||
        org.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => org.yStatus === statusFilter);
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(org => org.learningRegion === regionFilter);
    }

    // Budget filter
    if (budgetFilter !== 'all') {
      filtered = filtered.filter(org => org.budgetRange === budgetFilter);
    }

    // Pilot filter
    if (pilotFilter !== 'all') {
      if (pilotFilter === 'participated') {
        filtered = filtered.filter(org => org.participatedInPilot1);
      } else if (pilotFilter === 'invited') {
        filtered = filtered.filter(org => org.invited);
      } else if (pilotFilter === 'potential') {
        filtered = filtered.filter(org => org.potentialPilotInvite);
      }
    }

    setFilteredOrganizations(filtered);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="default" className="bg-green-100 text-green-800">Open</Badge>;
      case 'Closed':
        return <Badge variant="destructive">Closed</Badge>;
      case 'Merged':
        return <Badge variant="secondary">Merged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFacilityTypeBadge = (type?: string) => {
    switch (type) {
      case 'Facility':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Facility</Badge>;
      case 'Non-Facility':
        return <Badge variant="secondary">Non-Facility</Badge>;
      case 'Resident Camp':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Resident Camp</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getBudgetRangeBadge = (range?: string) => {
    if (!range) return null;
    
    const isLarge = range.includes('Over $14,000,000') || range.includes('$4,000,001');
    const isMedium = range.includes('$2,000,001') || range.includes('$1,000,001');
    
    if (isLarge) {
      return <Badge variant="default" className="bg-purple-100 text-purple-800">{range}</Badge>;
    } else if (isMedium) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">{range}</Badge>;
    } else {
      return <Badge variant="secondary">{range}</Badge>;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Association Number', 'Name', 'City', 'State', 'Status', 'Budget Range', 'Pilot Status', 'CEO', 'Phone', 'Email'].join(','),
      ...filteredOrganizations.map(org => [
        org.associationNumber,
        org.name,
        org.city || '',
        org.state || '',
        org.yStatus || '',
        org.budgetRange || '',
        org.participatedInPilot1 ? 'Participated' : org.invited ? 'Invited' : org.potentialPilotInvite ? 'Potential' : 'None',
        org.ceoName || '',
        org.phone || '',
        org.email || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ymca-associations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading YMCA associations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">YMCA Associations</h1>
          <p className="text-gray-600">Manage and view YMCA association data</p>
        </div>
        <Button onClick={exportData} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search associations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Merged">Merged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Region</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Southeast Region">Southeast</SelectItem>
                  <SelectItem value="Northeast Region">Northeast</SelectItem>
                  <SelectItem value="Midwest Region">Midwest</SelectItem>
                  <SelectItem value="West Region">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Budget Range</label>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="Under $650,000">Under $650K</SelectItem>
                  <SelectItem value="$650,001-$1,000,000">$650K-$1M</SelectItem>
                  <SelectItem value="$1,000,001-$2,000,000">$1M-$2M</SelectItem>
                  <SelectItem value="$2,000,001-$4,000,000">$2M-$4M</SelectItem>
                  <SelectItem value="$4,000,001-$14,000,000">$4M-$14M</SelectItem>
                  <SelectItem value="Over $14,000,000">Over $14M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Pilot Status</label>
              <Select value={pilotFilter} onValueChange={setPilotFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="potential">Potential</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="participated">Participated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Associations</p>
                <p className="text-2xl font-bold">{filteredOrganizations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Open Associations</p>
                <p className="text-2xl font-bold">
                  {filteredOrganizations.filter(org => org.yStatus === 'Open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pilot Participants</p>
                <p className="text-2xl font-bold">
                  {filteredOrganizations.filter(org => org.participatedInPilot1).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Unique States</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredOrganizations.map(org => org.state).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Associations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                  {org.doingBusinessAs && (
                    <p className="text-sm text-gray-600">DBA: {org.doingBusinessAs}</p>
                  )}
                  <p className="text-sm text-gray-500">#{org.associationNumber}</p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(org.yStatus)}
                  {getFacilityTypeBadge(org.facilityType)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>
                  {[org.city, org.state, org.zipCode].filter(Boolean).join(', ')}
                </span>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">CEO:</span> {org.ceoName || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Branches:</span> {org.associationBranchCount}
                </div>
                <div>
                  <span className="font-medium">Region:</span> {org.learningRegion || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Member Group:</span> {org.memberGroup || 'N/A'}
                </div>
              </div>

              {/* Budget */}
              {org.budgetRange && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  {getBudgetRangeBadge(org.budgetRange)}
                </div>
              )}

              {/* Pilot Status */}
              <div className="flex gap-2">
                {org.potentialPilotInvite && (
                  <Badge variant="outline" className="text-xs">Potential Pilot</Badge>
                )}
                {org.invited && (
                  <Badge variant="outline" className="text-xs">Invited</Badge>
                )}
                {org.participatedInPilot1 && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">Participated</Badge>
                )}
              </div>

              {/* Contact */}
              <div className="flex gap-4 text-sm">
                {org.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{org.phone}</span>
                  </div>
                )}
                {org.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{org.email}</span>
                  </div>
                )}
                {org.website && (
                  <a 
                    href={org.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrganizations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No associations found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
