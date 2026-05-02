import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import {
  useExerciseTemplates,
  useCreateExerciseTemplate,
  useUpdateExerciseTemplate,
  useDeleteExerciseTemplate,
  type ExerciseTemplate,
} from '../../hooks/useExerciseLibrary';
import { ApiErrorBanner } from '../components/ApiErrorBanner';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}, z.number().int().positive().optional());

const optionalString = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }
  return value;
}, z.string().optional());

const exerciseTemplateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.string().min(2, 'Category is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  sets: optionalNumber,
  reps: optionalNumber,
  duration: optionalString,
  instructions: optionalString,
  videoUrl: optionalString,
});

type ExerciseTemplateFormValues = z.infer<typeof exerciseTemplateSchema>;

const formResolver: Resolver<ExerciseTemplateFormValues> = async (values) => {
  const result = exerciseTemplateSchema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors: Record<string, any> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.map(String);
    if (path.length === 0) {
      errors.root = { type: issue.code, message: issue.message };
      continue;
    }

    let cursor = errors;
    for (let i = 0; i < path.length; i += 1) {
      const key = path[i];
      if (i === path.length - 1) {
        cursor[key] = { type: issue.code, message: issue.message };
      } else {
        cursor[key] = cursor[key] || {};
        cursor = cursor[key];
      }
    }
  }

  return { values: {}, errors };
};

const difficultyOptions = ['Easy', 'Medium', 'Hard'] as const;

const defaultValues: ExerciseTemplateFormValues = {
  name: '',
  category: '',
  difficulty: 'Easy',
  sets: undefined,
  reps: undefined,
  duration: '',
  instructions: '',
  videoUrl: '',
};

export function ExerciseLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExerciseTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExerciseTemplate | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category.trim() || undefined,
      difficulty: difficulty || undefined,
    }),
    [search, category, difficulty]
  );

  const {
    data: templates,
    isLoading,
    isError,
    error,
  } = useExerciseTemplates(filters);

  const createMutation = useCreateExerciseTemplate();
  const updateMutation = useUpdateExerciseTemplate(editingTemplate?.id ?? '');
  const deleteMutation = useDeleteExerciseTemplate();

  const form = useForm<ExerciseTemplateFormValues>({
    resolver: formResolver,
    defaultValues,
  });

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormError(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  };

  const openEditDialog = (template: ExerciseTemplate) => {
    setEditingTemplate(template);
    setFormError(null);
    form.reset({
      name: template.name,
      category: template.category,
      difficulty: template.difficulty,
      sets: template.sets ?? undefined,
      reps: template.reps ?? undefined,
      duration: template.duration ?? '',
      instructions: template.instructions ?? '',
      videoUrl: template.videoUrl ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (values: ExerciseTemplateFormValues) => {
    setFormError(null);
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }
      setDialogOpen(false);
      setEditingTemplate(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to save exercise template.';
      setFormError(message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Error is handled by the global query error banner on next fetch.
    }
  };

  const templateList = templates ?? [];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-8 pb-6 border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/doctor/exercise')}
                  aria-label="Back to assignments"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Exercise Library</h1>
                  <p className="text-sm text-slate-500">
                    Manage master templates that doctors assign to patients.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setCategory('');
                    setDifficulty('');
                  }}
                >
                  Clear filters
                </Button>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4" />
                  New template
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_0.8fr_0.6fr]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search exercises"
                  className="pl-9"
                />
              </div>
              <Input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Filter by category"
              />
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="max-w-6xl mx-auto w-full">
            {isError && <ApiErrorBanner error={error} />}

            {isLoading && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-40 rounded-xl border border-slate-200 bg-white animate-pulse"
                  />
                ))}
              </div>
            )}

            {!isLoading && !isError && templateList.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
                <p className="text-sm font-semibold text-slate-700">No exercise templates yet</p>
                <p className="mt-2 text-xs text-slate-500">
                  Create a template to start building the master exercise library.
                </p>
              </div>
            )}

            {!isLoading && !isError && templateList.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {templateList.map((template) => (
                  <Card key={template.id} className="border-slate-200">
                    <CardHeader className="gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-semibold text-slate-900">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-500">
                            {template.category}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{template.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        {template.sets != null && template.reps != null && (
                          <span className="rounded-md bg-slate-100 px-2 py-1">
                            {template.sets} sets x {template.reps} reps
                          </span>
                        )}
                        {template.duration && (
                          <span className="rounded-md bg-slate-100 px-2 py-1">
                            {template.duration}
                          </span>
                        )}
                      </div>
                      {template.instructions && (
                        <p className="text-xs text-slate-600">
                          {template.instructions.length > 120
                            ? `${template.instructions.slice(0, 120)}...`
                            : template.instructions}
                        </p>
                      )}
                      {template.videoUrl && (
                        <p className="text-xs text-slate-500 truncate">{template.videoUrl}</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(template)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(template)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-slate-200 bg-white">
        <BottomNav role="doctor" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit exercise template' : 'Create exercise template'}
            </DialogTitle>
            <DialogDescription>
              Keep the details consistent so assignments remain easy to scan.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Quad stretch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Strengthening" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyOptions.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sets</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reps</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="12"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 30 sec" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Step-by-step instructions"
                        className="min-h-[90px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingTemplate ? 'Save changes' : 'Create template'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template</AlertDialogTitle>
            <AlertDialogDescription>
              This hides the template from the library. Existing assignments stay intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
