'use client';

import { useState, useEffect } from 'react';
import { templates } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Template {
  id: number;
  name: string;
  description?: string;
  category?: string;
  organization_id: number;
  is_promoted: boolean;
  created_at: string;
}

export default function TemplatesPage() {
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [galleryTemplates, setGalleryTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [importTitle, setImportTitle] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const response = await templates.list();
    if (!response.error && response.data) {
      setTemplateList(response.data as Template[]);
    }

    const galleryResponse = await templates.gallery();
    if (!galleryResponse.error && galleryResponse.data) {
      setGalleryTemplates(galleryResponse.data as Template[]);
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!selectedTemplate) return;

    const response = await templates.import(selectedTemplate.id, importTitle);
    if (!response.error) {
      setShowImportModal(false);
      setSelectedTemplate(null);
      setImportTitle('');
      loadTemplates();
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Templates</h1>

      {showImportModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Import Template
            </h2>
            <p className="text-slate-600 mb-4">
              {selectedTemplate.name}
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Artifact Title
              </label>
              <Input
                type="text"
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
                placeholder={selectedTemplate.name}
              />
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleImport}>
                Import
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Templates</h2>
          {templateList.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600">No templates yet</p>
              <p className="text-sm text-slate-500 mt-2">Promote an artifact to create templates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templateList.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition"
                >
                  <h3 className="font-medium text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Templates</h2>
          {galleryTemplates.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600">No templates available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  {template.category && (
                    <p className="text-xs text-slate-500 mb-3">
                      Category: {template.category}
                    </p>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setImportTitle(template.name);
                      setShowImportModal(true);
                    }}
                  >
                    Import
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
